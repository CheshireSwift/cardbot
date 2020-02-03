import { Client } from 'discord.js'
import * as dotenv from 'dotenv'
import * as low from 'lowdb'
import * as FileAsync from 'lowdb/adapters/FileAsync'
import commands from './commands'
import { sendErrorResponse } from './messageUtils'
import parse from './parser'
import { getOrCreateGuildData } from './data'

dotenv.config()

const token = process.env.CARDBOT_USER_TOKEN
if (!token) {
  console.error('No user token! Set CARDBOT_USER_TOKEN env var')
  process.exit(1)
}

const adapter = new FileAsync<DBSchema>('db.json')
const dbConnection = low(adapter)

const client = new Client()

client.on('ready', () => {
  const userId = client.user.id
  parse.registerUserId(userId)
  console.log(`I am ready with ID ${userId} at ${Date()}!`)
})

// Create an event listener for messages
client.on('message', message => {
  try {
    if (!message.isMentioned(client.user)) {
      return
    }

    const { command, args } = parse(message.content)
    console.log({ command, args })

    const handler = commands[command]
    if (!handler) {
      sendErrorResponse(message, 'Unrecognised command: `' + command + '`')
      return
    }

    if (!handler.keepMessage) {
      message.delete()
    }

    dbConnection
      .then(db => handler({ db, message, guildData: getOrCreateGuildData(db, message.guild.id) }, ...args))
      .catch(e => {
        console.error('Handler error', { command, args })
        console.error(e)
      })
  } catch (e) {
    console.error('Parser error', e)
    return
  }
})

client.login(process.env.CARDBOT_USER_TOKEN)
