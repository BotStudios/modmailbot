module.exports = {
   name: 'delete',
   description: 'Delete (close) a specific thread',
   options: [
     { name: 'UserID', description: 'The ID of the user.' }
   ],
   run: async ({ bot, data, config, message, args }) => {
    if(!args[0])return bot.shortMessage(message, 'Please provide a user ID.', 'error');
    await bot.deleteThread({ User: args[0] }, message.author).then(() => message.reply({ embeds: [{ description: 'This thread will be deleted...'}] })).catch(err=> {});
   }    
}
