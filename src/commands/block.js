module.exports = {
    name: 'block',
    description: '',
    run: async ({ bot, data, config, message, args }) => {
        var id = message?.channel?.topic?.slice(3);
        if(args[0]) id = args[0];
        const userID = (await bot.client.users.cache.get(id))?.id;
        if(!userID)return bot.shortMessage(message, 'Couldn\'t find this user.', 'error', { name: 'Error' });
        const blocked = await bot.blockUser(userID, message?.author);
        if(!blocked)return bot.shortMessage(message, 'This user was blocked.', 'error', { name: 'Error' });
        return bot.shortMessage(message, `Successfully blocked <@!${userID}>(${userID})`, 'success', { name: 'User Blocked' });
    }
}
