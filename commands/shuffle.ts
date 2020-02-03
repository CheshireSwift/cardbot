import { getDeckDataOrSendError, targets, parseTarget } from '../deckManagement'
import { sendErrorResponse } from '../messageUtils'

const shuffle: CommandHandler = async ({ message, guildData }, which) => {
  const deckData = getDeckDataOrSendError(guildData, message)
  if (!deckData) {
    return
  }

  let target = parseTarget(which, targets.remaining)
  if (target === null) {
    sendErrorResponse(message, `Unrecognised shuffle target \`${which}\`.`)
    return
  }

  const { deck, name } = deckData
  const cards = deck.get('cards')

  if (target === targets.all) {
    cards.set('remaining', [...cards.get('remaining').value(), ...cards.get('drawn').value()])
    cards.set('drawn', [])
    target = targets.remaining
  }

  const cardsTarget = target as keyof Deck['cards']
  await cards
    .set(
      cardsTarget,
      cards
        .get(cardsTarget)
        .shuffle()
        .value(),
    )
    .write()

  message.channel.send(`Shuffled ${target} ${name}`)
}

export default shuffle
