module.exports = {
    name: 'ae',
    description: 'Edit a replied message anonymously',
    options: [
        { name: '[message]', description: 'Reply to a message to be edited' }
    ],
    run: async ({ bot, data, message, args }) => {
        if(!data)return;
        if(!message?.reference?.messageId) return bot.shortMessage(message, 'Please refer/reply to a message.', 'error').then(m => setTimeout(() => m.delete(), 2000));
        if(!args.join(" "))return bot.shortMessage(message, 'Please provide a message to be edited.', 'error').then(m => setTimeout(() => m.delete(), 2000));
        var msg = bot.editMsg.get(message?.reference?.messageId);
        if(!msg)return bot.shortMessage(message, 'This message cannot be edited.', 'error').then(m => setTimeout(() => m.delete(), 2000));
        return await msg.edit({ content: bot.getReplyContent(message, args.join(" "), true, true)?.data }).then(bot.editedEmbed(message, args, msg, true)).catch(err => console.log(err));
    }
} 
