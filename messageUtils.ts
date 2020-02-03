import { Message, RichEmbedOptions } from 'discord.js'

export async function sendErrorResponse(message: Message, text: string, deleteAfter: number | null = 5000) {
  const sent = message.channel.send(text)
  if (!deleteAfter) {
    return
  }

  const response = (await sent) as Message
  await new Promise(resolve => {
    setTimeout(resolve, deleteAfter)
  })
  response.delete()
}

export const cardEmbed = ({ title, image, fields, color }: Card, mini?: boolean): RichEmbedOptions => ({
  title,
  [mini ? 'thumbnail' : 'image']: image,
  fields: fields?.map(f => ({ ...f, inline: !mini || true })),
  color,
})

export const sendCard = (message: Message, mini?: boolean) => (card: Card) =>
  message.channel.send({ embed: cardEmbed(card, mini) })
