'use strict';
const Discord = require('discord.js');
const { GatewayIntentBits, Partials, ChannelType } = require('discord.js');
const collection = new Discord.Collection();
const client = new Discord.Client({ 
    intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences, GatewayIntentBits.MessageContent], 
    partials: [ Partials.Message, Partials.Channel, Partials.Reaction] 
});     
const utils = new (require('./manager'))(client, collection);
 
client.once('ready', async () => {
  await utils.ready(); 
  await utils.error.check() 
  console.log(client.user.tag)
}); 
client.on('messageCreate',  async (message) => {
  if(message.author.bot)return; 
  try{ 
    if(message.channel.type == ChannelType.DM) {        
    if(!collection.get(message.author.id))return await utils.createChannel(message);
     await utils.sendInbox(message);
  }
  if(message.content.startsWith(utils?.config?.prefix) && message.channel.type == ChannelType.GuildText) return await utils.command(message);
  if(message.channel.type == ChannelType.GuildText)return await utils.replyThread(message);
}catch(e) {
    console.log(e)
    message.react("❌")
}
})

client.login(utils.config.token);
