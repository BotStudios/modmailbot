module.exports = {
    name: 'close',
    description: '',
    run: async ({ bot, data, config, message, args }) => {
        if(!data)return; 
        await bot.deleteThread({ Channel: message.channel.id }, message.author);
    }
}
