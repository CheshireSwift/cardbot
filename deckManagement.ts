import { Message } from 'discord.js'
import { ObjectChain } from 'lodash'
import { sendErrorResponse } from './messageUtils'

export const deckToUse = (guildData: ObjectChain<GuildData>, message: Message): string | null => {
  const defaults = guildData.get(['defaults', message.author.id])
  const localDefault = defaults.get(message.channel.id)
  if (!localDefault.isEmpty().value()) {
    return localDefault.value()
  }

  const globalDefault = defaults.get('global')
  if (!globalDefault.isEmpty().value()) {
    return globalDefault.value()
  }

  return null
}

export const getDeckDataOrSendError = (
  guildData: ObjectChain<GuildData>,
  message: Message,
): { deck: ObjectChain<Deck>; name: string } | null => {
  const name = deckToUse(guildData, message)
  if (!name) {
    sendErrorResponse(message, 'Please specify a deck to use.')
    return null
  }

  const deck = guildData.get(['decks', name])
  if (deck.isEmpty().value()) {
    sendErrorResponse(message, `Selected deck (\`${name}\`) not found.`)
    return null
  }

  return { deck, name }
}

export type Target = keyof Deck['cards'] | 'all'
export const targets = {
  remaining: 'remaining' as 'remaining',
  drawn: 'drawn' as 'drawn',
  all: 'all' as 'all',
}

export const parseTarget = (which: string, fallback?: Target): Target | null | undefined => {
  if (!which) {
    return fallback
  }

  switch (which) {
    case 'deck':
    case 'remaining':
    case 'draw':
    case 'drawpile':
      return targets.remaining
    case 'discard':
    case 'drawn':
    case 'old':
    case 'used':
      return targets.drawn
    case 'all':
    case 'everything':
      return targets.all
    default:
      return null
  }
}
