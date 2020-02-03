let mentionRegex: RegExp

const parse = (content: string): Command => {
  const [command, ...args] = content
    .trim()
    .replace(/^\(/, '')
    .replace(/\)$/, '')
    // .replace(/: /g, ':')
    .trim()
    .split(/\s+/)
    .map(s => s.trim())
    .filter(s => !mentionRegex.test(s))
  return { command, args }
}

parse.registerUserId = (userId: string) => {
  mentionRegex = new RegExp(`^<@!?${userId}>$`)
}

export default parse
