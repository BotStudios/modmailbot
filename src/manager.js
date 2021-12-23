const Discord = require('discord.js');
const Utils = require('./utils');
const config = require('./config.js');

class Manager extends Utils {
  constructor(client, collection) {
    super(Discord, client, collection);
    this.collection = collection;
    this.client = client;
    this.cooldown = new Set();
    this.editMsg = new Discord.Collection();
    this.reservedCommand = ['delete', 'close', 'tags', 'tag', 'log', 'block', 'unblock', 'blocked', 'edit'];
}

async command(message) {
   if(!message.content.startsWith(config?.prefix))return await this.replyThread(message);
   if(!message?.member?.roles?.cache.some(role => role.id === `${config?.roleID}`))return;
   const data = await this.model.findOne({ Channel: message.channel.id });
   const args = message.content.slice(config?.prefix?.length).split(/ +/);
   const command = args.shift().toLowerCase();

   if(command == "close") {
    if(!data)return; 
    await this.deleteThread({ Channel: message.channel.id }, message.author);
   }else if(command == "delete"){
    if(!args[0])return this.shortMessage(message, 'Please provide a user ID.', 'error');
    await this.deleteThread({ User: args[0] }, message.author).then(() => message.reply({ embeds: [{ description: 'This thread will be deleted...'}] })).catch(err=> {});
   }else if(command == "tags") { 
     var embed = new Discord.MessageEmbed().setAuthor('Snippets'); 
     var tags = ""; var tagCount = 0;
     const data = await this.getTags(); 
     for(var i in data) { tagCount++; tags += `${tagCount}. ${i}\n`; }
     if(tagCount == 0) tags += `The tag list was empty at the moment`;
     embed.setDescription(tags).setColor('RANDOM'); message.reply({ embeds: [embed] });
   }else if(command == "tag"){
       if(!args[0])return this.error.provideATag(message);
       switch(args[0]) {
           case "create":
            if(!args[1])return this.error.provideATag(message);
            if(!args[2])return this.error.provideAValue(message);
            if(args[1].length > 20)return this.error.exceedLimit(message, 'Tag name', 20);
            var tagValue = args?.splice(2)?.join(" ")
            if(tagValue > 500 || tagValue < 1)return this.error.exceedLimit(message, 'Tag value', 500);
            await this.createTag(args[1], tagValue);
            return this.shortMessage(message, await this.getTag(args[1]), 'custom', { name: `Snippet for ${args[1]}` }).catch(console.log)
            break;
            case "delete":
            if(!args[1])return this.error.provideATag(message);
            const wasDeleted = await this.deleteTag(args[1]);    
            if(!wasDeleted)return this.error.tagDoesNotExist(message);
            return this.shortMessage(message, `**${args[1]}** was removed from the tag list.`, 'error');  
            break;       
            default: 
            var info = await this.getTag(args[0]);
            if(!info)return this.shortMessage(message, `This log does not exist.`, 'error');
            return this.shortMessage(message, info, 'custom', { name: `Snippet for ${args[0]}` });
            

        }
   }else if(command == "log") {
     if(!config?.logThreads)return this.shortMessage(message, 'Modmail logs are disabled.', 'error');
      switch(args[0]) { 
          case "delete":
          if(config?.secureLogs == true)return this.shortMessage(message, "Modmail logs are protected.", 'error', { name: 'Secure Logs'})
          if(!args[1])return this.shortMessage(message, 'Please provide a log ID.', 'custom');
          const wasDeleted = await this.deleteLog(args[1], message?.author);   
          if(!wasDeleted)return this.shortMessage(message, 'This log does not exist.', 'error', { name: 'Error' });
          return this.shortMessage(message, `**${args[1]}** was removed from the modmail log.`, 'error');  
          break;
          case "view":
          if(config?.secureLogs == true)return this.shortMessage(message, "Modmail logs are protected.", 'error', { name: 'Secure Logs'});
          if(!args[1])return this.shortMessage(message, 'Please provide a log ID.', 'custom');
          const data = await this.getLog(args[1]);
          if(!data)return this.shortMessage(message, 'This log does not exist.', 'error', { name: 'Error' });
          const content = JSON.stringify({
            User: data?.User,
            Channel: data?.Channel,
            Messages: data?.Messages,
            Id: data?.Id
          });
          return message.reply({ files: [ new this.Discord.MessageAttachment(Buffer.from(content, 'utf-8'), 'message.txt') ] })
          break;
          case "this":
          const id = message?.channel?.topic?.slice(3);
          if(!id)return this.shortMessage(message, 'This is not a modmail thread channel.', 'error', { name: 'Invalid Channel' });
          const user = await this.client.users.cache.get(id);
          const dt = await this.getLogsByUserId(user.id);
          var ct = ''; var dataCount = 0;
          dt.forEach((e) => {
          dataCount++; ct += `${dataCount}. [\`${e?.Id}\`](${config?.logsURI}/${e?.Id}) - <t:${e?.Timestamp}>\n`;
          });
          if(dataCount < 1)ct += `Couldn't find any records for ${user.tag}`;
          return this.shortMessage(message, ct, 'custom', { name: `Thread logs for ${user.username}`, icon_url: user.avatarURL() });
          break;
          case "adduser": 
          const usr = await this.client.users.cache.get(args[1]);
          if(!usr) return this.shortMessage(message, 'Please provide a valid user ID', 'error', { name: 'Error' });
          if((await this.getlogViewers())?.includes(usr.id)) return this.shortMessage(message, 'This user can already view the logs', 'error');
          await this.addLogViewer(usr.id);
          this.shortMessage(message, `Successfully added <@!${usr.id}>(${usr.id}) to the logs viewer list.`, 'success', { name: 'Log Viewer Added' });
          break;
          case "removeuser":
          const remUsr = await this.removelogViewer(args[1]);
          if(!remUsr)return this.shortMessage(message, 'This user cannot view the logs.', 'error');
          return this.shortMessage(message, `Successfully removed <@!${args[1]}>(${args[1]}) from the log viewer list.`, 'success', { name: 'Log Viewer Remove' });
          break;
          case "viewers":
         const viewers = await this.getlogViewers();
         return this.listingEmbed(message, viewers, "No one can view the logs.", "Logs Viewer");
          break;          
          default:
            if(!args[0])return this.shortMessage(message, 'Please provide a log ID.', 'error');
            var info = await this.getLog(args[0]);
            if(!info)return this.shortMessage(message, 'This log doesn not exist.', 'error', { name: 'Error' });
            return this.shortMessage(message, `**User ID:** \`${info.User}\`\n**Channel ID:** \`${info.Channel}\``, 'custom', { name: 'Modmail Log', url: `${config?.logsURI}/${info.Id}` })
      }
   }else if(command == "block") {
      var id = message?.channel?.topic?.slice(3);
      if(args[0]) id = args[0];
      const userID = (await this.client.users.cache.get(id))?.id;
      if(!userID)return this.shortMessage(message, 'Couldn\'t find this user.', 'error', { name: 'Error' });
      const blocked = await this.blockUser(userID, message?.author);
      if(!blocked)return this.shortMessage(message, 'This user was blocked.', 'error', { name: 'Error' });
      return this.shortMessage(message, `Successfully blocked <@!${userID}>(${userID})`, 'success', { name: 'User Blocked' });
   }else if(command == "unblock") {
     if(!args[0])return this.shortMessage(message, 'Please provide a user ID.', 'error');
     const unblocked = await this.unblockUser(args[0], message?.author);
     if(!unblocked)return this.shortMessage(message, 'This is not a blocked user.', 'error');
     return this.shortMessage(message, `Successfully unblocked <@!${args[0]}>(${args[0]})`, 'success', { name: 'User Unblocked' });
   }else if(command == "blocked") {
     const blocked = await this.getBlockedUsers();     
     return this.listingEmbed(message, blocked, "No one was blocked.", "Blocked Users");
   }else if(command == "edit"){
    if(!data)return; 
    if(!message?.reference?.messageId) return this.shortMessage(message, 'Please refer to a message.', 'error');
    if(!args.join(" "))return this.shortMessage(message, 'Please provide a message to be edited.', 'error');
    var msg = this.editMsg.get(message?.reference?.messageId);
    if(!msg)return this.shortMessage(message, 'This message cannot be edited.', 'error');
    return msg.edit(this.getReplyContent(message, args.join(" "), true)).then(this.shortMessage(message, `\`\`\`fix\n${args.join(" ")}\`\`\``, 'success', { name: `Message Edited By ${message?.author?.tag}`, icon_url: `${message?.author?.avatarURL()}`}, { text: `ID : ${msg?.id}` }));
   }else { await this.replyThread(message); }   
}


getReplyContent(message, content, isEdited = false) {
 var image = [];
 if(!content && content != "")return;
 if(message?.attachments?.size > 0) {
     image.push('\n');
     message.attachments.forEach((e) => {
     image.push(`${e.proxyURL || ""}`);
 });
}
return `**${isEdited ? 'Edited ' : ''}Reply From ${message.author.username} : **\n`+`${content}${image ? image.join("\n") : ''}`

}

async replyThread(message) {
   if(message.channel.type == 'DM')return;
   if(!message?.member?.roles?.cache.some(role => role.id === `${config?.roleID}`))return;
   const data = await this.model.findOne({ Channel: message.channel.id });
   if(!data)return;
   var content;
   var replyMsgId = message.id;
   var repliedMsg;
   if(config?.replyCommand && message.content.startsWith(`${config?.prefix}${config?.replyCommand}`)){
      content = message.content.slice(config?.prefix?.length+config?.replyCommand?.length+1);
   }else if(!config?.replyCommand) content = message?.content;
   if(message.content.startsWith(`${config?.prefix}`)){
      const tag = await this.getTag(message?.content?.slice(config?.prefix?.length));
      if(tag && !this.reservedCommand.includes(message?.content?.slice(config?.prefix?.length))) {
          this.shortMessage(message, `${tag}`, 'success', { name: `${message.author.tag}`, icon_url: `${message?.author?.avatarURL()}` }).then((m) => replyMsgId = m?.id);
          content = tag;
      }
   }
   if(data.Channel == message?.channel?.id) {
    await this.client.users.cache.get(data.User).send(this.getReplyContent(message, content)).then(async msg => {
    repliedMsg = msg;
try{  await message.react('✅') }catch(e) {}
    }).catch(err => { message.react('❌') });
   }else if(message?.channel?.id?.startsWith('ID:')){
    await this.client.users.cache.get(message?.channel?.topic.slice(3)).send(this.getReplyContent(message, content)).then(msg => {
    repliedMsg = msg;
    message.react('✅');
    message.reply(`Successfully Send Message To <@${message?.channel?.topic.slice(3)}>`).then(m => { setTimeout(() => { m.delete() }, 3000) });
    }).catch(err => { message.react('❌'); })
   }  

   if (data){
    data.Messages = this.getContent(data?.Channel, message, data?.Messages || []).Messages;
    this.collection.set(data?.User, data);
    if(replyMsgId && repliedMsg) this.editMsg.set(`${replyMsgId}`, repliedMsg);
    await data.save().catch((err) => { });
  }
}

  inboxEmbed(message, firstMsg) {
  var embed = new Discord.MessageEmbed()
   .setTimestamp()
   .setFooter(`ID : ${message.author.id}`)
   .setColor(`${config?.colors?.custom}`)
   .setAuthor(`${message?.author?.tag}`, `${message?.author?.avatarURL()}`);
   if(firstMsg) embed.setDescription(`**From:** <@!${message?.author?.id}>${message?.content ? `\n\`\`\`fix\n${message?.content}\`\`\`` : ''}`)
                     .addField('Account Created On', `<t:${Math.floor(new Date(message?.author?.createdAt).getTime() / 1000)}> <t:${Math.floor(new Date(message?.author?.createdAt).getTime() / 1000)}:R>`)
   if(!firstMsg) { 
       embed.setAuthor(`From ${message?.author?.tag}`, `${message?.author?.avatarURL()}`);
       if(message?.content) embed.setDescription(`**Message:**\`\`\`fix\n${message?.content}\`\`\``) 
    }
    return embed;
  }


async sendInbox(message, firstMsg = false) {
    const embeds = [];
    const embed = this.inboxEmbed(message, firstMsg);
    const settings = await this.settings.findOne({});
    if(settings?.blocked?.includes(message.author.id)) return message.react("❌");
    const data = await this.getThread({ User: message.author.id });
    if(!data)return await this.createChannel(message);
    if (message.attachments.size > 0) {
    message.attachments.forEach((e) => {
     embeds.push(new Discord.MessageEmbed().setDescription(`${e.proxyURL || ""}`).setImage(`${e.proxyURL || ""}`).setColor(`${config?.colors?.custom}`));
    });
   }
   if (data) {
    data.Messages = this.getContent(data?.Channel, message, data?.Messages || []).Messages;
    this.collection.set(data?.User, data);
    data.save().catch((err) => { });
  }
   message.react("✅");
   return await this.client.channels.cache.get(data.Channel).send({ ...config?.notifyMsg && firstMsg == true ?  { content: config?.notifyMsg } : {}, embeds: [embed, ...embeds]}).catch(console.log);

}
  
getContent(channel, message, messages = []) {
   const context = [];
   if (message.content) context.push(message.content);
   if (message.attachments.size > 0){
         message.attachments.forEach((e) => {
              context.push(`[${e.proxyURL}]`);
        });    
    }
    return {
        User: message.author.id,
        Channel: channel, 
        Messages: [ ...messages, { [`${message.author.tag}`] : { content: `${context.join(" ")}`, avatar: message?.author?.avatarURL({ format: 'jpg' }), timestamp: message.createdAt, recipient: message?.channel?.type != 'DM' ? true : false } } ]
    };
  }
  
async createChannel(message) {
    const settings = await this.settings.findOne({});
    if(settings?.blocked?.includes(message.author.id)) return message.react("❌");
    if(this.cooldown.has(message.author.id)) return message.react("❌").then(this.shortMessage(message, "You're on a cooldown, please resend this message after a few seconds", 'error', { name: 'Slow Down...'}));
    this.cooldown.add(message.author.id);
    const guild = await this.client.guilds.cache.get(config.guildID);
   const channel = await guild.channels.create(`${message.author.username}`, { type: "GUILD_TEXT", parent: config.category, permissionOverwrites: [{ id: guild.id, deny: ["VIEW_CHANNEL"] }, { id: config.roleID, allow: ["VIEW_CHANNEL"]}, {
    id: this.client.user.id, allow: ["VIEW_CHANNEL"]
  }], topic: `ID:${message.author.id}` });
   const props = this.getContent(channel.id, message);
   this.collection.set(props.User, props);
   await this.createThread({
    User: message.author.id,
    Channel: channel.id,
    Messages: []
}).then(() => {
    this.emit('threadCreate', message);    
    message.react('✅');
 });
setTimeout(async () => {
    this.cooldown.delete(message.author.id);
   await this.sendInbox(message, true).then((m) => m.pin()).catch(err => {});
}, 1000)
  }


  
}

module.exports = Manager;
