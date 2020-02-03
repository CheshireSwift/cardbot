import { sendErrorResponse } from '../messageUtils'

// optional template/JSON data for quick populate?
const create: CommandHandler = async ({ message, guildData }, name, template) => {
  const decks = guildData.get('decks')
  if (
    !decks
      .get(name)
      .isEmpty()
      .value()
  ) {
    sendErrorResponse(message, `Deck named \`${name}\` already exists.`)
    return
  }

  await decks
    .set(name, {
      owner: message.author.id,
      cards: {
        drawn: [],
        remaining: [],
      },
    } as Deck)
    .write()

  message.channel.send(`Created \`${name}\`!`)
}

export default create
