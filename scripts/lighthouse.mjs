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
 *   --save-dir=<path>            (Directory to store raw Lighthouse JSON audits)
 *
 * Reports 5-run median metrics, main-thread work breakdown (script, style/layout, paint),
 * observed LCP, TBT, CLS, and score.
 *
 * Usage:
 *   node scripts/lighthouse.mjs [/route1] [/route2] [--throttling-method=devtools|simulate|both] [--save-dir=docs/perf/head]
 */

import { spawnSync } from 'child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'

// Load .env.local if present to read staging test guards
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

/**
 * Reset loopback runner rate limits on staging Redis before each test iteration.
 * 
 * Safety Guards:
 * 1. Strictly refuses to execute in production (VERCEL_ENV=production).
 * 2. Restricted to verified test environments matching E2E_SUPABASE_URL.
 * 3. Point deletions ONLY for the test runner's loopback IP (127.0.0.1).
 *    NEVER calls keys('rl:*') or scans shared database keys.
 * 4. Logs any connection warnings explicitly (no empty catch blocks).
 */
async function resetRunnerRateLimits() {
  if (process.env.ALLOW_RATE_LIMIT_RESET !== '1') {
    return
  }

  if (process.env.VERCEL_ENV === 'production') {
    throw new Error('SAFETY VIOLATION: Cannot reset rate limits in production (VERCEL_ENV=production).')
  }

  const e2eUrl = process.env.E2E_SUPABASE_URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!e2eUrl || e2eUrl !== supabaseUrl) {
    return
  }

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!redisUrl || !redisToken) return

  try {
    const redisHost = new URL(redisUrl).host
    console.log(`[lighthouse] Resetting rate limits on Redis host: ${redisHost}`)
    const { Redis } = await import('@upstash/redis')
    const redis = new Redis({ url: redisUrl, token: redisToken })
    const now = Date.now()
    const windowSize = 60000 // 60s sliding window from lib/supabase/rate-limit.ts
    const currentWindow = Math.floor(now / windowSize)
    // Verified prefixes from lib/supabase/rate-limit.ts:
    // rl:auth, rl:order, rl:checkout, rl:search
    const prefixes = ['rl:auth', 'rl:order', 'rl:checkout', 'rl:search']
    const keysToDelete = []
    for (const prefix of prefixes) {
      keysToDelete.push(
        `${prefix}:127.0.0.1`,
        `${prefix}:127.0.0.1:${currentWindow}`,
        `${prefix}:127.0.0.1:${currentWindow - 1}`,
        `${prefix}:127.0.0.1:${currentWindow + 1}`
      )
    }
    await redis.del(...keysToDelete)
  } catch (err) {
    console.warn('[lighthouse] Loopback rate limit reset notice:', err.message)
  }
}

const CHROME_PATH = process.env.CHROME_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : 'google-chrome')
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const RUNS = parseInt(process.env.RUNS || '5', 10)

const args = process.argv.slice(2)
let throttlingMethodArg = 'simulate'
let saveDirArg = null
let headersFileArg = null
const targetRoutes = []

for (const arg of args) {
  if (arg.startsWith('--throttling-method=')) {
    throttlingMethodArg = arg.split('=')[1]
  } else if (arg.startsWith('--save-dir=')) {
    saveDirArg = arg.split('=')[1]
  } else if (arg.startsWith('--headers-file=')) {
    headersFileArg = arg.split('=')[1]
  } else if (!arg.startsWith('--')) {
    targetRoutes.push(arg)
  }
}

const TARGET_ROUTES = targetRoutes.length > 0
  ? targetRoutes
  : ['/', '/products', '/products/classic-ruled-school-notebook']

function slugify(route) {
  if (route === '/') return 'home'
  return route.replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9_-]/g, '_')
}

function runLighthouse(url, method = 'simulate') {
  const chromeFlags = [
    '--headless',
    '--no-sandbox',
    '--disable-dev-shm-usage',
  ]
  if (process.env.CHROME_USER_DATA_DIR) {
    chromeFlags.push(`--user-data-dir=${process.env.CHROME_USER_DATA_DIR}`)
  }

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
    `--chrome-flags=${chromeFlags.join(' ')}`,
    '--quiet',
  ]

  if (headersFileArg) {
    flags.push(`--extra-headers=${path.resolve(process.cwd(), headersFileArg)}`)
  }

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

  const rawJson = res.stdout
  const json = JSON.parse(rawJson)
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
    rawJson,
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

async function benchmarkRouteMethod(route, method, saveDir) {
  const fullUrl = route.startsWith('http') ? route : `${BASE_URL}${route}`
  const routeSlug = slugify(route)
  process.stdout.write(`Benchmarking ${route} [${method}] (${RUNS} runs)... `)

  const runs = []
  for (let i = 1; i <= RUNS; i++) {
    process.stdout.write(`[${i}/${RUNS}] `)
    await resetRunnerRateLimits()
    const result = runLighthouse(fullUrl, method)
    runs.push(result)

    if (saveDir) {
      const runFilePath = path.join(saveDir, `${routeSlug}_${method}_run${i}.json`)
      writeFileSync(runFilePath, result.rawJson, 'utf8')
    }
  }
  process.stdout.write('Done.\n')

  // Pick median run by LCP (simLcp for simulate, observedLcp for devtools)
  if (method === 'simulate') {
    runs.sort((a, b) => a.simLcp - b.simLcp)
  } else {
    runs.sort((a, b) => a.observedLcp - b.observedLcp)
  }

  const medianRun = runs[Math.floor(runs.length / 2)]

  if (saveDir) {
    const medianFilePath = path.join(saveDir, `${routeSlug}_${method}_median.json`)
    writeFileSync(medianFilePath, medianRun.rawJson, 'utf8')
  }

  // Remove rawJson from returned object to avoid excessive memory retention
  const cleanMedian = { ...medianRun }
  delete cleanMedian.rawJson

  return {
    route,
    method,
    ...cleanMedian,
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
  if (saveDirArg) {
    console.log(`Raw Audits Dir:    ${saveDirArg}`)
    mkdirSync(saveDirArg, { recursive: true })
  }
  console.log(`========================================================================\n`)

  const methods = throttlingMethodArg === 'both' ? ['simulate', 'devtools'] : [throttlingMethodArg]

  for (const method of methods) {
    console.log(`\n--- Starting Benchmarks for: [${method.toUpperCase()}] ---`)
    const results = []
    for (const route of TARGET_ROUTES) {
      try {
        const res = await benchmarkRouteMethod(route, method, saveDirArg)
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
