module.exports = {
    name: 'blocked',
    description: '',
    run: async ({ bot, data, config, message, args }) => {
        const blocked = await bot.getBlockedUsers();     
        return bot.listingEmbed(message, blocked, "No one was blocked.", "Blocked Users");
    }
}
