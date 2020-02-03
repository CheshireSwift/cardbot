import { Message } from 'discord.js'
import { ObjectChain } from 'lodash'
import { getDeckDataOrSendError, parseTarget, Target, targets } from '../deckManagement'
import { sendCard } from '../messageUtils'

const show: CommandHandler = async ({ message, guildData }, which) => {
  const oldSend = message.channel.send.bind(message.channel)
  message.channel.send = ((...args: any[]) => {
    console.log(...args)
    oldSend(...args)
  }) as any
  const deckData = getDeckDataOrSendError(guildData, message)
  if (!deckData) {
    return
  }

  const { deck, name } = deckData
  const cards = deck.get('cards')
  console.log(JSON.stringify(cards.value(), null, 2))
  console.log(
    cards
      .get('remaining')
      .size()
      .value()
      .toString(),
  )
  console.log(
    cards
      .get('drawn')
      .size()
      .value()
      .toString(),
  )

  const target = parseTarget(which)
  await (target ? sendDetail(message, cards, target) : sendSummary(message, cards, name))
}

const sendDetail = (message: Message, cards: ObjectChain<Deck['cards']>, target: Target) => {
  const displayCards =
    target === targets.all
      ? [...cards.get('drawn').value(), ...cards.get('remaining').value()]
      : cards.get(target as keyof Deck['cards']).value()

  return Promise.all(displayCards.map(sendCard(message, true)))
}

const sendSummary = (message: Message, cards: ObjectChain<Deck['cards']>, title: string) =>
  message.channel.send({
    embed: {
      title,
      fields: [summaryField(cards, 'Remaining deck', targets.remaining), summaryField(cards, 'Drawn', targets.drawn)],
    },
  })

const summaryField = (cards: ObjectChain<Deck['cards']>, name: string, field: keyof Deck['cards']) => ({
  name,
  value: cards
    .get(field)
    .size()
    .value()
    .toString(),
})

export default show
