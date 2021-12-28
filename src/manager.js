const Utils = require('./utils');
const config = require('./config.js');

class Manager extends Utils {
  constructor(client, collection) {
    super(client, collection);
    this.collection = collection;
    this.client = client;
    this.cooldown = new Set();
    this.editMsg = new this.Discord.Collection();
    this.reservedCommand = ['delete', 'close', 'tags', 'tag', 'log', 'block', 'unblock', 'blocked', 'edit'];
}

async command(message) {
   if(!message.content.startsWith(config?.prefix))return await this.replyThread(message);
   if(!message?.member?.roles?.cache.some(role => role.id === `${config?.roleID}`))return;
   const data = await this.model.findOne({ Channel: message.channel.id });
   const args = message.content.slice(config?.prefix?.length).split(/ +/);
   const command = this.commands.get(args.shift().toLowerCase());
   if(!command) return await this.replyThread(message);  
   try { await command.run({ bot: this, data, config, message, args }) } catch (error) { console.log(error);await message.reply({ embeds: [{ description: 'Something Went Wrong', color: '#e83838' }], ephemeral: true }) }
}


getReplyContent(message, content, isEdited = false, anonymous = false) {
 var image = [];
 if(message?.attachments?.size > 0) {
     image.push('\n');
     message.attachments.forEach((e) => {
     image.push(`${e.proxyURL || ""}`);
 });
}
if(`${content || ""}${image ? image.join("\n") : ''}` == "")return;
return `**${isEdited ? 'Edited ' : ''}Reply From ${anonymous ? 'The Staff Team' : `${message.author.username}`} : **\n`+`${content || ""}${image ? image.join("\n") : ''}`

}

async replyThread(message) {
   if(message.channel.type == 'DM')return;
   if(!message?.member?.roles?.cache.some(role => role.id === `${config?.roleID}`))return;
   const data = await this.model.findOne({ Channel: message.channel.id });
   if(!data)return;
   var isTag = false; var userId; var repliedMsg; var replyMsgId = message?.id; var content;
   if(config?.replyCommand && message.content.startsWith(`${config?.prefix}${config?.replyCommand}`)){
      content = message.content.slice(config?.prefix?.length+config?.replyCommand?.length+1);
   }else if(!config?.replyCommand) content = message?.content;
   if(message.content.startsWith(`${config?.prefix}`)){
      const tag = await this.getTag(message?.content?.slice(config?.prefix?.length));
      if(tag && !this.reservedCommand.includes(message?.content?.slice(config?.prefix?.length))) {
          this.shortMessage(message, `${tag}`, 'success', { name: `${message.author.tag}`, icon_url: `${message?.author?.avatarURL()}` }).then((m) => replyMsgId = m?.id);
          content = tag;
          isTag = true;
      }
   }
   if(data.Channel == message?.channel?.id) {
     userId = data.User;
   }else if(message?.channel?.id?.startsWith('ID:')){
     userId = message?.channel?.id?.slice(3);
   }  
   if(!userId)return this.shortMessage(message, 'This user does not exist.', 'error');
   this.client.users.cache.get(userId).send(this.getReplyContent(message, content)).then(msg => {
    repliedMsg = msg;
    message.react('✅');
    message.reply(`Successfully Send Message To <@${message?.channel?.topic.slice(3)}>`).then(m => { setTimeout(() => { m.delete() }, 3000) });
    }).catch(err => { message.react('❌'); })
   if (data){
    data.Messages = this.getContent(data?.Channel, message, data?.Messages || [], content, isTag).Messages;
    this.collection.set(data?.User, data);
    if(replyMsgId && repliedMsg) this.editMsg.set(`${replyMsgId}`, repliedMsg);
    await data.save().catch((err) => { });
  }
}

  inboxEmbed(message, firstMsg) {
  var embed = new this.Discord.MessageEmbed()
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
     embeds.push(new this.Discord.MessageEmbed().setDescription(`${e.proxyURL || ""}`).setImage(`${e.proxyURL || ""}`).setColor(`${config?.colors?.custom}`));
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
  
getContent(channel, message, messages = [], content, isTag = false) {
   const context = [];
   if (content && message?.content) context.push(content);
   if (content && message?.content != '' && content != message?.content) isTag = true; 
   if(!content && message?.content) context.push(message?.content);
   if (message.attachments.size > 0){
         message.attachments.forEach((e) => {
              context.push(`[${e.proxyURL}]`);
        });    
    }
    return {
        User: message.author.id,
        Channel: channel, 
        Messages: [ ...messages, { [`${message.author.tag}`] : { content: `${context.join(" ")}`, avatar: message?.author?.avatarURL({ format: 'jpg' }), timestamp: message.createdAt, recipient: message?.channel?.type != 'DM' ? true : false, isTag } } ]
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
