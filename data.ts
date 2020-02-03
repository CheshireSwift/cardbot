const emtpyGuildData = (): GuildData => ({
  defaults: {},
  decks: {},
  lastAction: {},
})

export const getOrCreateGuildData = (db: Database, guildId: string) => {
  const guildData = db.get(guildId)
  if (guildData.isEmpty().value()) {
    db.set(guildId, emtpyGuildData()).write()
  }

  return guildData
}
