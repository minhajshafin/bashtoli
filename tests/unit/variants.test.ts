import { describe, it, expect } from 'vitest'
import { generateOptionCombinations } from '@/lib/utils/generate-variants'

describe('generateOptionCombinations()', () => {
  it('returns a single empty combination record if input is empty', () => {
    expect(generateOptionCombinations([])).toEqual([{}])
  })

  it('handles single dimension options (e.g. Size)', () => {
    const options = [{ name: 'Size', values: ['S', 'M', 'L'] }]
    const result = generateOptionCombinations(options)
    expect(result).toEqual([
      { Size: 'S' },
      { Size: 'M' },
      { Size: 'L' },
    ])
  })

  it('handles multi-dimension options (e.g. Size and Color)', () => {
    const options = [
      { name: 'Size', values: ['S', 'M'] },
      { name: 'Color', values: ['Red', 'Blue'] },
    ]
    const result = generateOptionCombinations(options)
    expect(result).toEqual([
      { Size: 'S', Color: 'Red' },
      { Size: 'S', Color: 'Blue' },
      { Size: 'M', Color: 'Red' },
      { Size: 'M', Color: 'Blue' },
    ])
  })

  it('filters empty option names and empty option values', () => {
    const options = [
      { name: '', values: ['S', 'M'] },
      { name: 'Color', values: [] },
      { name: 'Size', values: ['S'] },
    ]
    const result = generateOptionCombinations(options)
    expect(result).toEqual([{ Size: 'S' }])
  })
})
