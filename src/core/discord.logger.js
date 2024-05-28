const { Client, GatewayIntentBits } = require('discord.js')

DISCORD_TOKEN = process.env.DISCORD_TOKEN
CHANNEL_ID = process.env.DISCORD_CHANNEL

class DiscordLogger {
  static getDiscordLogger() {
    if (!this.discordInstance) this.discordInstance = new DiscordLogger()
    return this.discordInstance
  }
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    })

    this.channelId = CHANNEL_ID
    this.client.on('ready', () => {
      console.log('Discord connected')
    })
    this.client.login(DISCORD_TOKEN)
  }

  log(message, params) {
    const channel = this.client.channels.cache.get(this.channelId)
    if (!channel) {
      console.log('Not found channel discord')
      return
    }
    channel
      .send(
        `info::${params.requestId}::${params.context}::${message}::${new Date()}::${JSON.stringify(params.metadata)}`,
      )
      .catch((e) => {
        console.log('error::', e)
      })
  }
  error(message, params) {
    const channel = this.client.channels.cache.get(this.channelId)
    if (!channel) {
      console.log('Not found channel discord')
      return
    }
    channel
      .send(
        `error::${params.requestId}::${params.context}::${message}::${new Date()}::${JSON.stringify(params.metadata)}`,
      )
      .catch((e) => {
        console.log('error::', e)
      })
  }
}

module.exports = DiscordLogger.getDiscordLogger()
