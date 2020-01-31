import * as dotenv from 'dotenv'

dotenv.config()

const token = process.env.CARDBOT_USER_TOKEN
if (!token) {
  console.error('No user token! Set CARDBOT_USER_TOKEN env var')
  process.exit(1)
}

import * as low from 'lowdb'
import * as FileAsync from 'lowdb/adapters/FileAsync'
import { Client, Message } from 'discord.js'

type DBSchema = {
  [guild: string]: GuildData
}

type GuildData = {
  globalDeck?: string
  channelDecks: {
    [channel: string]: string
  }
  decks: {
    [name: string]: Deck
  }
}

type Deck = {
  cards: {
    drawn: Card[]
    remaining: Card[]
  }
}

type Card = {
  image: string | null
}

type Database = low.LowdbAsync<DBSchema>
type CommandHandler = (context: { db: Database; message: Message }, ...args: string[]) => Promise<any>

const commands: { [name: string]: CommandHandler } = {
  add: async ({ db, message }, title, ...pairs) => {
    // try {
    //   if (message.content.startsWith('!add')) {
    //     message.delete()
    //     const guildId = message.guild.id
    //     console.log(message.attachments.first().url, ' |!!| ', message.attachments.first().proxyURL)
    //     const guild = db.get(guildId)
    //     if (guild.isEmpty().value()) {
    //       db.set(guildId, { foods: [] } as GuildData).write()
    //     }
    //     await guild
    //       .get('foods', [])
    //       .push(message.content.split(' ')[1])
    //       .write()
    //     const foods = (await db.get([guildId, 'foods']).value()) + ''
    //     message.channel.send(foods.substr(Math.max(foods.length - 1000, 0)))
    //   }
    // } catch (e) {
    //   console.error(e)
    //   return
    // }
  },
}

const adapter = new FileAsync<DBSchema>('db.json')
const dbConnection = low(adapter)

const client = new Client()

let mentionRegex: RegExp
client.on('ready', () => {
  mentionRegex = new RegExp(`^<@!?${client.user.id}>$`)
  console.log(`I am ready with ID ${client.user.id} at ${Date()}!`)
})

async function sendErrorResponse(message: Message, text: string, deleteAfter?: number) {
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

// Create an event listener for messages
client.on('message', async message => {
  try {
    if (!message.isMentioned(client.user)) {
      return
    }

    // Message was definitely *intended* for bot.
    message.delete()

    const [command, ...args] = message.content
      .trim()
      .replace(/^\(/, '')
      .replace(/\)$/, '')
      .replace(': ', ':')
      .trim()
      .split(/\s+/)
      .map(s => s.trim())
      .filter(s => !mentionRegex.test(s))

    console.log({ command, args })

    try {
      const handler = commands[command]
      if (!handler) {
        sendErrorResponse(message, 'Unrecognised command: `' + command + '`', 5000)
        return
      }

      handler({ db: await dbConnection, message }, ...args)
    } catch (e) {
      console.error('Handler error', e)
      return
    }
  } catch (e) {
    console.error('Parser error', e)
    return
  }
})

client.login(process.env.CARDBOT_USER_TOKEN)
