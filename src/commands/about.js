module.exports = {
    name: 'about',
    description: 'Learn more about this [modmailbot](https://github.com/BotStudios/ModmailBot)',
    run: ({ bot, message, config }) => {
        var totalSeconds = (bot?.client?.uptime / 1000)
        , days = Math.floor(totalSeconds / 86400); totalSeconds %= 86400;
        var hours = Math.floor(totalSeconds / 3600); totalSeconds %= 3600;
        var minutes = Math.floor(totalSeconds / 60),
        seconds = Math.floor(totalSeconds % 60);
        return message.reply({ embeds: [new bot.Discord.MessageEmbed()
           .setAuthor('Modmail - About',  bot?.client?.user?.avatarURL(), 'https://github.com/BotStudios/ModmailBot')
           .setDescription('A feature rich [discord.js](https://github.com/discordjs/discord.js) Modmail Bot,\n highly inspired by other modmail bots out there.')
           .addField('Author', '[`@joeleeofficial`](https://github.com/joeleeofficial), [`@leecheeyong`](https://github.com/leecheeyong), [`@w3cy`](https://github.com/w3cy)', false)
           .addField('Uptime', `${days}d, ${hours}h, ${minutes}m and ${seconds}s`, true)
           .addField('Latency', `${Date.now() - message.createdTimestamp}ms`, true)
           .addField('API Latency', `${Math.round(bot?.client?.ws?.ping)}ms`, true)
           .addField('Links', `
           [\`Github\`](https://github.com/BotStudios/ModmailBot)
           [\`Logs Viewer\`](https://github.com/BotStudios/logs-viewer)
           [\`Support Server\`](https://discord.com/invite/vYwH7Sa9N8)
           [\`Docs\`](https://github.com/BotStudios/ModmailBot/wiki)
           `, true)
           .addField('Information', `
           *Version* : \`v${config?.version}\`
           *Log Threads* : \`${config?.logThreads ? 'Yes' : 'No'}\`
           *Prefix* : \`${config?.config?.prefix}\`
           *Staff Role* : <@&${config?.config?.roleID || 'Unset'}>
           *Logs URI* : \`${config?.config?.logsURI || 'Unset'}\`
           `, true)
           .setTimestamp()
        ]});
        }
}
