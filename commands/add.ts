import { MessageAttachment } from 'discord.js'
import { cardEmbed, sendErrorResponse } from '../messageUtils'
import { getDeckDataOrSendError } from '../deckManagement'
import { partition } from 'lodash'
import * as toHex from 'colornames'

const add: CommandHandler = async ({ message, guildData }, ...args) => {
  const deckData = getDeckDataOrSendError(guildData, message)
  if (!deckData) {
    return
  }

  const { deck, name } = deckData

  try {
    const { title, pairs } = parseAddArgs(args)
    console.log(title, pairs)
    const att = message.attachments.first()
    const card = makeCard(title, pairs, att)
    console.log(JSON.stringify(cardEmbed(card)))
    await deck
      .get(['cards', 'remaining'])
      .push(card)
      .write()
    message.channel.send(`Successfully added ${title || 'card'} to ${name}.`, { embed: cardEmbed(card) })
  } catch (e) {
    console.error(e)
    sendErrorResponse(message, `Format error.`)
  }
}

// Deleting the message can make pictures var sad.
add.keepMessage = true

const parseAddArgs = (args: string[]) => {
  const mergeChunksWithColonCaps = (acc: string[], word: string) => {
    // first word just gets dumped in
    if (acc.length < 1) {
      return [word]
    }

    const [chunk, ...rest] = acc
    if (word.includes(':')) {
      // start new chunk
      return ['', word + chunk, ...rest]
    } else {
      // keep merging
      return [(word + ' ' + chunk).trim(), ...rest]
    }
  }
  const smooshedArgs = args.reduceRight<string[]>(mergeChunksWithColonCaps, [])
  const hasTitle = !smooshedArgs[0].includes(':')
  return hasTitle ? { title: smooshedArgs[0], pairs: smooshedArgs.slice(1) } : { title: undefined, pairs: smooshedArgs }
}

const makeCard = (title: string | undefined, pairs: string[], attachment: MessageAttachment | undefined): Card => {
  const allFields = pairs.map(pairToField)
  const [colorField, fields] = partition(allFields, f => f.name === 'color' || f.name === 'c')
  const hexColor = toHex(colorField.pop()?.value)
  const color = hexColor ? parseInt(hexColor.replace('#', ''), 16) : undefined
  console.log({ allFields, fields, colorField, hexColor, color })
  return {
    title,
    color,
    image: attachment && { url: attachment.proxyURL },
    fields,
  }
}

const pairToField = (pair: string) => {
  const split = pair.split(':')
  if (split.length !== 2) {
    throw new CardFormatError(`Incorrectly formatted pair: ${pair}`)
  }

  const [name, value] = split
  return { name, value }
}

class CardFormatError extends Error {
  constructor(message: string, ...params: any[]) {
    super(...params)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CardFormatError)
    }

    this.name = 'CardFormatError'
    this.message = message
  }
}

export default add
