module.exports = {
    name: 'blocked',
    description: 'A list of blocked users',
    run: async ({ bot, data, config, message, args }) => {
        const blocked = await bot.getBlockedUsers();     
        return bot.listingEmbed(message, blocked, "No one was blocked.", "Blocked Users");
    }
}
