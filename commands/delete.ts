import { sendErrorResponse } from '../messageUtils'

const del: CommandHandler = async ({ message, guildData }, name) => {
  const decks = guildData.get('decks')
  if (
    decks
      .get(name)
      .isEmpty()
      .value()
  ) {
    sendErrorResponse(message, `Deck named \`${name}\` not found.`)
    return
  }

  await decks.set(name, undefined).write()
  message.channel.send(`Deleted \`${name}\`.`)
}

export default del
