declare type CommandHandler = ((
  context: { db: Database; message: import('discord.js').Message; guildData: import('lodash').ObjectChain<GuildData> },
  ...args: string[]
) => Promise<any>) & { keepMessage?: boolean }
