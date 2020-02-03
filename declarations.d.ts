declare type DBSchema = {
  [guild: string]: GuildData
}

declare type Command = { command: string; args: string[] }

declare type GuildData = {
  lastAction: {
    [channelId: string]: Command
  }
  defaults: {
    [userId: string]: DefaultDecksConfig
  }
  decks: {
    [name: string]: Deck
  }
}

declare type DefaultDecksConfig = {
  [channel: string]: string | undefined
  global?: string
}

declare type Deck = {
  owner: string
  cards: {
    drawn: Card[]
    remaining: Card[]
  }
}

declare type Card = {
  title?: string
  image?: { url: string }
  fields?: Array<{ name: string; value: string }>
  color?: number
}

declare type Database = import('lowdb').LowdbAsync<DBSchema>
