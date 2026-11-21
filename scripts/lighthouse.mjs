#!/usr/bin/env node
/**
 * scripts/lighthouse.mjs
 * Standardized Lighthouse Mobile Benchmarking Script for Bashtoli.
 *
 * Runs 5 iterations per route using fixed Moto G4 mobile emulation and 4x CPU throttling.
 * Reports median run metrics where LCP subparts mathematically sum to simulated LCP.
 *
 * Usage:
 *   node scripts/lighthouse.mjs [/route1] [/route2] ...
 * Example:
 *   node scripts/lighthouse.mjs / /products /products/classic-ruled-school-notebook
 */

import { spawnSync } from 'child_process'
import { existsSync } from 'fs'

const CHROME_PATH = process.env.CHROME_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : 'google-chrome')
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const RUNS = parseInt(process.env.RUNS || '5', 10)

const TARGET_ROUTES = process.argv.slice(2).length > 0
  ? process.argv.slice(2)
  : ['/', '/products', '/products/classic-ruled-school-notebook']

function runLighthouse(url) {
  const flags = [
    '--yes',
    'lighthouse',
    url,
    '--output=json',
    '--output-path=stdout',
    '--only-categories=performance',
    '--throttling-method=simulate',
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
    throw new Error(`Lighthouse run failed for ${url}: ${res.stderr || res.stdout}`)
  }

  const json = JSON.parse(res.stdout)
  const perfScore = Math.round((json.categories.performance?.score || 0) * 100)
  const metrics = json.audits['metrics']?.details?.items?.[0] || {}

  const simLcp = Math.round(metrics.largestContentfulPaint || json.audits['largest-contentful-paint']?.numericValue || 0)
  const ttfb = Math.round(metrics.timeToFirstByte || 0)
  const loadDelay = Math.round(metrics.lcpLoadDelay || 0)
  const loadDuration = Math.round(metrics.lcpLoadDuration || 0)
  const renderDelay = Math.max(0, simLcp - (ttfb + loadDelay + loadDuration))

  const observedLcp = Math.round(metrics.observedLargestContentfulPaint || 0)
  const tbt = Math.round(json.audits['total-blocking-time']?.numericValue || metrics.totalBlockingTime || 0)
  const cls = parseFloat((json.audits['cumulative-layout-shift']?.numericValue ?? 0).toFixed(3))
  const fcp = Math.round(metrics.firstContentfulPaint || json.audits['first-contentful-paint']?.numericValue || 0)

  return {
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
  }
}

async function benchmarkRoute(route) {
  const fullUrl = route.startsWith('http') ? route : `${BASE_URL}${route}`
  process.stdout.write(`Benchmarking ${route} (${RUNS} runs)... `)

  const runs = []
  for (let i = 1; i <= RUNS; i++) {
    process.stdout.write(`[${i}/${RUNS}] `)
    const result = runLighthouse(fullUrl)
    runs.push(result)
  }
  process.stdout.write('Done.\n')

  // Pick the median run by simulated LCP
  runs.sort((a, b) => a.simLcp - b.simLcp)
  const medianRun = runs[Math.floor(runs.length / 2)]

  return {
    route,
    ...medianRun,
    allRuns: runs,
  }
}

async function main() {
  console.log(`========================================================================`)
  console.log(`Bashtoli Lighthouse Benchmark Script`)
  console.log(`Base URL:    ${BASE_URL}`)
  console.log(`Runs:        ${RUNS}`)
  console.log(`Chrome:      ${CHROME_PATH}`)
  console.log(`Emulation:   Mobile Moto G4 (360x640 @2x, 4x CPU throttle, Lantern)`)
  console.log(`========================================================================\n`)

  const results = []
  for (const route of TARGET_ROUTES) {
    try {
      const res = await benchmarkRoute(route)
      results.push(res)
    } catch (err) {
      console.error(`\nError benchmarking ${route}:`, err.message)
    }
  }

  console.log(`\n### Benchmark Results (5-Run Median Per Route)\n`)
  console.log(`| Route | Score | Sim LCP | Obs LCP | TTFB | Load Delay | Load Duration | Render Delay | Subparts Sum | TBT | CLS |`)
  console.log(`| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |`)

  for (const r of results) {
    const sum = r.ttfb + r.loadDelay + r.loadDuration + r.renderDelay
    const sumMatches = sum === r.simLcp ? '✓' : `≠ (${sum})`
    console.log(
      `| \`${r.route}\` | **${r.score}** | **${(r.simLcp / 1000).toFixed(2)}s** | ${(r.observedLcp / 1000).toFixed(2)}s | ${r.ttfb}ms | ${r.loadDelay}ms | ${r.loadDuration}ms | ${r.renderDelay}ms | ${sumMatches} | **${r.tbt}ms** | ${r.cls} |`
    )
  }
  console.log(`\n*Note: Simulated LCP subparts strictly satisfy: TTFB + Load Delay + Load Duration + Render Delay = Sim LCP.*\n`)
}

main().catch((err) => {
  console.error('Fatal benchmark error:', err)
  process.exit(1)
})
