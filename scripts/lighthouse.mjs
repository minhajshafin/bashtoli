#!/usr/bin/env node
/**
 * scripts/lighthouse.mjs
 * Standardized Lighthouse Mobile Benchmarking Script for Bashtoli.
 *
 * Runs 5 iterations per route using fixed Moto G4 mobile emulation and 4x CPU throttling.
 * Supports:
 *   --throttling-method=simulate (Lantern)
 *   --throttling-method=devtools (Chrome DevTools live throttling)
 *   --throttling-method=both     (Runs both cross-checks)
 *
 * Reports 5-run median metrics, main-thread work breakdown (script, style/layout, paint),
 * observed LCP, TBT, CLS, and score.
 *
 * Usage:
 *   node scripts/lighthouse.mjs [/route1] [/route2] [--throttling-method=devtools|simulate|both]
 * Example:
 *   node scripts/lighthouse.mjs /bag /checkout /products/classic-ruled-school-notebook --throttling-method=both
 */

import { spawnSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import path from 'path'

// Load .env.local if present
const envPath = path.resolve(process.cwd(), '.env.local')
if (existsSync(envPath)) {
  const content = readFileSync(envPath, 'utf8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim()
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) {
        process.env[key] = val
      }
    }
  }
}

async function clearRateLimits() {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { Redis } = await import('@upstash/redis')
      const redis = Redis.fromEnv()
      const keys = await redis.keys('rl:*')
      if (keys.length > 0) {
        await Promise.all(keys.map((k) => redis.del(k)))
      }
    } catch {
      // Ignore if Redis unreachable
    }
  }
}

const CHROME_PATH = process.env.CHROME_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : 'google-chrome')
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const RUNS = parseInt(process.env.RUNS || '5', 10)

const args = process.argv.slice(2)
let throttlingMethodArg = 'simulate'
const targetRoutes = []

for (const arg of args) {
  if (arg.startsWith('--throttling-method=')) {
    throttlingMethodArg = arg.split('=')[1]
  } else if (!arg.startsWith('--')) {
    targetRoutes.push(arg)
  }
}

const TARGET_ROUTES = targetRoutes.length > 0
  ? targetRoutes
  : ['/', '/products', '/products/classic-ruled-school-notebook']

function runLighthouse(url, method = 'simulate') {
  const flags = [
    '--yes',
    'lighthouse',
    url,
    '--output=json',
    '--output-path=stdout',
    '--only-categories=performance',
    `--throttling-method=${method}`,
    '--form-factor=mobile',
    '--screenEmulation.mobile=true',
    '--screenEmulation.width=360',
    '--screenEmulation.height=640',
    '--screenEmulation.deviceScaleFactor=2',
    '--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage',
    '--quiet',
  ]

  const env = {
    ...process.env,
    CHROME_PATH,
  }

  const res = spawnSync('npx', flags, {
    env,
    maxBuffer: 50 * 1024 * 1024,
    encoding: 'utf8',
  })

  if (res.status !== 0) {
    throw new Error(`Lighthouse run failed for ${url} (${method}): ${res.stderr || res.stdout}`)
  }

  const json = JSON.parse(res.stdout)
  const perfScore = Math.round((json.categories.performance?.score || 0) * 100)
  const metrics = json.audits['metrics']?.details?.items?.[0] || {}

  const simLcp = Math.round(metrics.largestContentfulPaint || json.audits['largest-contentful-paint']?.numericValue || 0)
  const ttfb = Math.round(metrics.timeToFirstByte || 0)
  const loadDelay = Math.round(metrics.lcpLoadDelay || 0)
  const loadDuration = Math.round(metrics.lcpLoadDuration || 0)
  const renderDelay = Math.max(0, simLcp - (ttfb + loadDelay + loadDuration))

  const observedLcp = Math.round(metrics.observedLargestContentfulPaint || json.audits['largest-contentful-paint']?.numericValue || 0)
  const tbt = Math.round(json.audits['total-blocking-time']?.numericValue || metrics.totalBlockingTime || 0)
  const cls = parseFloat((json.audits['cumulative-layout-shift']?.numericValue ?? 0).toFixed(3))
  const fcp = Math.round(metrics.firstContentfulPaint || json.audits['first-contentful-paint']?.numericValue || 0)

  // Main thread work breakdown
  const workItems = json.audits['mainthread-work-breakdown']?.details?.items || []
  const scriptWork = Math.round(
    workItems
      .filter((i) => i.group === 'scriptEvaluation' || i.group === 'scriptParseCompile')
      .reduce((sum, i) => sum + i.duration, 0)
  )
  const styleLayoutWork = Math.round(
    workItems
      .filter((i) => i.group === 'styleLayout')
      .reduce((sum, i) => sum + i.duration, 0)
  )
  const paintWork = Math.round(
    workItems
      .filter((i) => i.group === 'paintCompositeRender')
      .reduce((sum, i) => sum + i.duration, 0)
  )
  const otherWork = Math.round(
    workItems
      .filter((i) => i.group === 'other' || i.group === 'parseHTML')
      .reduce((sum, i) => sum + i.duration, 0)
  )

  return {
    method,
    score: perfScore,
    simLcp,
    observedLcp,
    ttfb,
    loadDelay,
    loadDuration,
    renderDelay,
    tbt,
    cls,
    fcp,
    scriptWork,
    styleLayoutWork,
    paintWork,
    otherWork,
  }
}

async function benchmarkRouteMethod(route, method) {
  const fullUrl = route.startsWith('http') ? route : `${BASE_URL}${route}`
  process.stdout.write(`Benchmarking ${route} [${method}] (${RUNS} runs)... `)

  const runs = []
  for (let i = 1; i <= RUNS; i++) {
    process.stdout.write(`[${i}/${RUNS}] `)
    await clearRateLimits()
    const result = runLighthouse(fullUrl, method)
    runs.push(result)
  }
  process.stdout.write('Done.\n')

  // Pick median run by LCP (simLcp for simulate, observedLcp for devtools)
  if (method === 'simulate') {
    runs.sort((a, b) => a.simLcp - b.simLcp)
  } else {
    runs.sort((a, b) => a.observedLcp - b.observedLcp)
  }

  const medianRun = runs[Math.floor(runs.length / 2)]

  return {
    route,
    method,
    ...medianRun,
    allRuns: runs,
  }
}

async function main() {
  console.log(`========================================================================`)
  console.log(`Bashtoli Lighthouse Benchmark Script`)
  console.log(`Base URL:          ${BASE_URL}`)
  console.log(`Runs per config:   ${RUNS}`)
  console.log(`Throttling Mode:   ${throttlingMethodArg}`)
  console.log(`Chrome Executable: ${CHROME_PATH}`)
  console.log(`Emulation:         Mobile Moto G4 (360x640 @2x, 4x CPU throttle)`)
  console.log(`========================================================================\n`)

  const methods = throttlingMethodArg === 'both' ? ['simulate', 'devtools'] : [throttlingMethodArg]

  for (const method of methods) {
    console.log(`\n--- Starting Benchmarks for: [${method.toUpperCase()}] ---`)
    const results = []
    for (const route of TARGET_ROUTES) {
      try {
        const res = await benchmarkRouteMethod(route, method)
        results.push(res)
      } catch (err) {
        console.error(`\nError benchmarking ${route}:`, err.message)
      }
    }

    console.log(`\n### Benchmark Results (${RUNS}-Run Median Per Route - ${method.toUpperCase()})\n`)
    if (method === 'simulate') {
      console.log(`| Route | Score | Sim LCP | Obs LCP | TTFB | Load Delay | Load Duration | Render Delay | Subparts Sum | TBT | CLS |`)
      console.log(`| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |`)
      for (const r of results) {
        const sum = r.ttfb + r.loadDelay + r.loadDuration + r.renderDelay
        const sumMatches = sum === r.simLcp ? '✓' : `≠ (${sum})`
        console.log(
          `| \`${r.route}\` | **${r.score}** | **${(r.simLcp / 1000).toFixed(2)}s** | ${(r.observedLcp / 1000).toFixed(2)}s | ${r.ttfb}ms | ${r.loadDelay}ms | ${r.loadDuration}ms | ${r.renderDelay}ms | ${sumMatches} | **${r.tbt}ms** | ${r.cls} |`
        )
      }
    } else {
      console.log(`| Route | Score | Obs LCP | TBT | CLS | Script Work | Style/Layout Work | Paint Work |`)
      console.log(`| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |`)
      for (const r of results) {
        console.log(
          `| \`${r.route}\` | **${r.score}** | **${(r.observedLcp / 1000).toFixed(2)}s** | **${r.tbt}ms** | ${r.cls} | ${r.scriptWork}ms | ${r.styleLayoutWork}ms | ${r.paintWork}ms |`
        )
      }
    }
  }
  console.log(`\n*Benchmark completed.*\n`)
}

main().catch((err) => {
  console.error('Fatal benchmark error:', err)
  process.exit(1)
})
