module.exports = {
    name: 'delete',
   description: '',
   run: async ({ bot, data, config, message, args }) => {
    if(!args[0])return bot.shortMessage(message, 'Please provide a user ID.', 'error');
    await bot.deleteThread({ User: args[0] }, message.author).then(() => message.reply({ embeds: [{ description: 'This thread will be deleted...'}] })).catch(err=> {});
   }    
}
