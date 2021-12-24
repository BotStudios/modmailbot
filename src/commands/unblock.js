module.exports = {
    name: 'unblock',
    description: 'Unblock a user',
    run: async ({ bot, data, config, message, args }) => {
        if(!args[0])return bot.shortMessage(message, 'Please provide a user ID.', 'error');
        const unblocked = await bot.unblockUser(args[0], message?.author);
        if(!unblocked)return bot.shortMessage(message, 'This is not a blocked user.', 'error');
        return bot.shortMessage(message, `Successfully unblocked <@!${args[0]}>(${args[0]})`, 'success', { name: 'User Unblocked' });
    }
}
