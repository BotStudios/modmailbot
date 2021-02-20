'use strict';
const Discord = require('discord.js');
const path = require('./path.js')
require('dotenv').config()
const client = new Discord.Client();
const Discord = require('discord.js');
const client = new Discord.Client();
const server = process.env.INBOX
client.on("message", async (message) => {
const inbox = client.channels.cache.get(server)
const prefix = process.env.PREFIX

if (!message.content.startsWith(prefix) && !message.channel.id == inbox) return;

const args = message.content.slice(prefix.length).trim().split(' ');
const command = args.shift().toLowerCase();
const args1 = args[0] || message.author.id;

if(command == "reply"){
    if(message.channel.id == inbox){

   client.users.cache.get(args1).send( `**Reply From ${message.author.username} : **\n`+`${args[1] || ""}${args[2] || ""}${args[3] || ""}${args[4] || ""}${args[5] || ""}${args[6] || ""}${args[7] || ""}${args[8] || ""}${args[9] || ""}${args[10] || ""}${args[11] || ""}${args[12] || ""}${args[13] || ""}${args[14] || ""}${args[15] || ""}${args[16] || ""}${args[17] || ""}${args[18] || ""}${args[19] || ""}${args[20] || ""}${args[21] || ""}${args[22] || ""}`)
   message.reply(`Successfully Send Message To <@${args[0]}>`)  
   message.react('✅');
    }else {
      
    }
}



})



client.on("message", async (message) => {
  if(message.author.bot) return;


if(message.channel.type == 'dm'){
    message.react('✅');
  const inbox = client.channels.cache.get(server);
if(message.author.id == `${client.user.id}`){
}else {
    inbox.send(`${message.author} : ${message.content}`);
}
}
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}! Modmail Is Ready !`);
});
client.login(process.env.TOKEN)




