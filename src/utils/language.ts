export const findLanguageCode = (
  reaction: string,
  langcodes: { [key: string]: string }
): string => {
  if (reaction.match(/flag-/)) {
    const result = reaction.match(/flag-([a-z]{2})/)
    return result ? langcodes[result[1]] : ""
  }

  return Object.keys(langcodes).includes(reaction) ? langcodes[reaction] : ""
}
