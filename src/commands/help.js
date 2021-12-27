module.exports = {
    name: 'help',
    description: 'Learn more about a specific command',
    options: [
        { name: 'Command', description: 'Name of a command' }
    ],
    run: async ({ bot, message, config, args }) => {
      if(args[0]) {
       const command = bot.commands.get(args[0]); var fields = null; var fieldContents = '';
       if(!command) return bot.shortMessage(message, `Couldn't Find This Command **(${args[0]})**`, 'error', { name: 'Command Not Found' });
       content = command?.description;
       if(Array.isArray(command?.options)) command?.options?.forEach((e) => {
          fieldContents += `\`${e?.name}\` - ${e?.description}\n`
       }); fields = [{ name: 'Options', value: fieldContents }];
       bot.shortMessage(message, content, 'custom',  null, { text: `BotStudios/ModmailBot - ${config?.version}` }, `${config?.prefix}${command.name}`, fields)
      }else {
      var content = ``;
      bot.commands.each((e) => {
        content += `**\`${e?.name}\`** - ${e?.description}\n`;
      })
      bot.shortMessage(message, content, 'custom',  null, { text: `BotStudios/ModmailBot - ${config?.version}` }, `Commands`)
      }
    }
}
