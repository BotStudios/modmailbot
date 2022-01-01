module.exports = {
    name: 'edit',
    description: 'Edit a replied message',
    options: [
        { name: '[message]', description: 'Reply to a message to be edited' }
    ],
    run: async ({ bot, data, config, message, args }) => {
        if(!data)return; 
        if(!message?.reference?.messageId) return bot.shortMessage(message, 'Please refer/reply to a message.', 'error');
        if(!args.join(" "))return bot.shortMessage(message, 'Please provide a message to be edited.', 'error');
        var msg = bot.editMsg.get(message?.reference?.messageId);
        if(!msg)return bot.shortMessage(message, 'This message cannot be edited.', 'error');
        return await msg.edit({ content: bot.getReplyContent(message, args.join(" "), true)?.data }).then(bot.shortMessage(message, `\`\`\`fix\n${args.join(" ")}\`\`\``, 'success', { name: `Message Edited By ${message?.author?.tag}`, icon_url: `${message?.author?.avatarURL()}`}, { text: `ID : ${msg?.id}` })).catch(err => console.log(err));
    }
} 
