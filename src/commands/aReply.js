module.exports = {
    name: 'ar',
    description: 'Reply to a thread/user anonymously',
    options: [
        { name: 'message', description: 'Message to reply' }
    ],
    run: async ({ bot, data, config, message, args }) => {
        if(!data)return;
        var content = message.content.slice(config?.prefix?.length+3); var isTag = false; var userid; var repliedMsg; var replyMsgId;
        if(args[0] && args[0].startsWith('--')) {
          const tag = await bot.getTag(message.content.slice(config?.prefix?.length+5));
          if(tag) { content = tag; isTag = true; bot.shortMessage(message, `${tag}`, 'success', { name: `${message.author.tag} (Anonymously)`, icon_url: `${message?.author?.avatarURL()}` }).then((m) => replyMsgId = m?.id);}
        }
        var content = bot.getReplyContent(message, content, false, true);
        if(!content)return bot.shortMessage(message, 'Please provide a message', 'error');
        if(message?.channel?.id == data.Channel) {
            userid = data.User;
        }else if(message?.channel?.id?.startsWith('ID:')){
            userid = message?.channel?.id?.startsWith('ID:');
        }
        const user = await bot.client.users.cache.get(userid);
        if(!user) return bot.shortMessage(message, 'This user does not exist.', 'error');
        user.send(content).then(msg => {
            repliedMsg = msg; 
            message.react('✅');
            message.reply(`Successfully Send Message To <@!${data.User}> \`Anonymously\``).then(m => { setTimeout(() => { m.delete() }, 3000) }) }).catch(err => { message.react('❌'); })
        if (data){
           data.Messages = bot.getContent(data?.Channel, message, data?.Messages || [], content, isTag).Messages;
           bot.collection.set(data?.User, data);
           if(replyMsgId && repliedMsg) bot.editMsg.set(`${replyMsgId}`, repliedMsg);
           await data.save().catch((err) => { });
        }
    } 
}
