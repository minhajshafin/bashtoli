export type OptionInput = {
  name: string
  values: string[]
}

/**
 * Generates Cartesian product combinations of option values.
 *
 * For example:
 *   generateOptionCombinations([
 *     { name: 'Size', values: ['S', 'M'] },
 *     { name: 'Color', values: ['Red', 'Blue'] }
 *   ])
 *
 * Output:
 *   [
 *     { Size: 'S', Color: 'Red' },
 *     { Size: 'S', Color: 'Blue' },
 *     { Size: 'M', Color: 'Red' },
 *     { Size: 'M', Color: 'Blue' }
 *   ]
 *
 * If the input array is empty, it returns a single empty combination `[{}]`,
 * which serves as the default option structure.
 */
export function generateOptionCombinations(
  options: OptionInput[]
): Record<string, string>[] {
  if (options.length === 0) {
    return [{}]
  }

  // Filter out any options without values to avoid breaking Cartesian generation
  const validOptions = options.filter(
    (opt) => opt.name.trim() !== '' && opt.values.length > 0
  )

  if (validOptions.length === 0) {
    return [{}]
  }

  return validOptions.reduce<Record<string, string>[]>(
    (acc, option) => {
      const next: Record<string, string>[] = []
      for (const combo of acc) {
        for (const value of option.values) {
          next.push({
            ...combo,
            [option.name.trim()]: value.trim(),
          })
        }
      }
      return next
    },
    [{}]
  )
}
