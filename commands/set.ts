import { sendErrorResponse } from '../messageUtils'
import { Message } from 'discord.js'

const deckSetter = (keyGen: (message: Message) => string, purpose: string): CommandHandler => async (
  { message, guildData },
  deck,
) => {
  if (!deck) {
    sendErrorResponse(message, 'Please specify a deck to use.')
    return
  }

  const defaults = guildData.get('defaults')
  if (
    defaults
      .get(message.author.id)
      .isEmpty()
      .value()
  ) {
    await defaults.set(message.author.id, {}).write()
  }

  await defaults.set([message.author.id, keyGen(message)], deck).write()

  message.channel.send(`Using \`${deck}\` as ${purpose}.`)
}

export const local: CommandHandler = deckSetter(message => message.channel.id, 'channel default')
export const global: CommandHandler = deckSetter(() => 'global', 'global default')
