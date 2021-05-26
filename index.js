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

if (!message.content.startsWith(Prefix) && !message.channel.id == inbox) return;
const args = message.content.slice(Prefix.length).trim().split(' ');
const command = args.shift().toLowerCase();
const args1 = args[0] 
if(command == "check"){
  message.delete()
  if(message.channel.id == inbox){
    resolve(message.author.tag+' Ran Check Command')
const embed = new Discord.MessageEmbed()
   .setDescription(`**Permissions Checker**\n\n> Check If The Bot Has Permission That It Needs\n\n- Add Reaction : **${message.member.guild.me.hasPermission('ADD_REACTIONS')}**\n- Manage Message : **${message.member.guild.me.hasPermission('MANAGE_MESSAGES')}**\n- Embed Links : **${message.member.guild.me.hasPermission('EMBED_LINKS')}**\n- Read Message History : **${message.member.guild.me.hasPermission('READ_MESSAGE_HISTORY')}**\n- View Channel : **${message.member.guild.me.hasPermission('VIEW_CHANNEL')}**\n- Send Message : **${message.member.guild.me.hasPermission('SEND_MESSAGES')}**`)
   .setFooter('Check The Console For More Information')
   message.channel.send(embed).catch(err => {
     message.channel.send(`**Permissions Checker**\n\n> Check If The Bot Has Permission That It Needs\n\n- Add Reaction : **${message.member.guild.me.hasPermission('ADD_REACTIONS')}**\n- Manage Message : **${message.member.guild.me.hasPermission('MANAGE_MESSAGES')}**\n- Embed Links : **${message.member.guild.me.hasPermission('EMBED_LINKS')}**\n- Read Message History : **${message.member.guild.me.hasPermission('READ_MESSAGE_HISTORY')}**\n- View Channel : **${message.member.guild.me.hasPermission('VIEW_CHANNEL')}**\n- Send Message : **${message.member.guild.me.hasPermission('SEND_MESSAGES')}**`)
     reject(`Modmail.js Error : ${err}`)
   })
  }
}
if(command == "reply"){
    if(message.channel.id == inbox){
    
if(args1 == undefined || args1 == ""){
 message.delete()
 message.reply('Please Provide A User ID').then(msg => {
    msg.delete({timeout:5000})
  }).catch(err => {
    reject(`Modmail.js Error : ${err}`)
  })
}else{
  if(args[1] == undefined || args[1] == ""){
    message.delete()
    message.reply('Please Provide A Message').then(msg => {
      msg.delete({timeout:5000})
    }).catch(err => {
    reject(`Modmail.js Error : ${err}`)
  })
  }else{
     try{
     client.users.cache.get(args1).send( `**Reply From ${message.author.username} : **\n`+`${message.content.slice(Prefix.length+7+args[0].length)}`).catch(err => {
    reject(`Modmail.js Error : ${err}`)
  })
   message.reply(`Successfully Send Message To <@${args[0]}>`).then(msg => {
     msg.delete({timeout:3000})
   }).catch(err => {
    reject(`Modmail.js Error : ${err}`)
  })
   message.react('✅');
   }catch(e){
     message.reply(e)
   }
  }}
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




