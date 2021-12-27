module.exports = {
    name: 'log',
    description: 'Modmail log actions',
    options: [
        { name: 'delete [logID]', description: 'Delete a specific log' },
        { name: 'view', description: 'View a specific log' },
        { name: 'this', description: 'View current user\'s past threads' },
        { name: 'adduser', description: 'Add a user to the log viewers list' },
        { name: 'removeuser', description: 'Remove a user from the log viewers list' },
        { name: 'any <logID>', description: 'Overview of a specific log' }
    ],
    run: async ({ bot, data, config, message, args }) => {
        if(!config?.logThreads)return bot.shortMessage(message, 'Modmail logs are disabled.', 'error');
        switch(args[0]) { 
            case "delete":
            if(config?.secureLogs == true)return bot.shortMessage(message, "Modmail logs are protected.", 'error', { name: 'Secure Logs'})
            if(!args[1])return bot.shortMessage(message, 'Please provide a log ID.', 'custom');
            const wasDeleted = await bot.deleteLog(args[1], message?.author);   
            if(!wasDeleted)return bot.shortMessage(message, 'This log does not exist.', 'error', { name: 'Error' });
            return bot.shortMessage(message, `**${args[1]}** was removed from the modmail log.`, 'error');  
            break;
            case "view":
            if(config?.secureLogs == true)return bot.shortMessage(message, "Modmail logs are protected.", 'error', { name: 'Secure Logs'});
            if(!args[1])return bot.shortMessage(message, 'Please provide a log ID.', 'custom');
            const data = await bot.getLog(args[1]);
            if(!data)return bot.shortMessage(message, 'bot log does not exist.', 'error', { name: 'Error' });
            const content = JSON.stringify({
              User: data?.User,
              Channel: data?.Channel,
              Messages: data?.Messages,
              Id: data?.Id
            });
            return message.reply({ files: [ new bot.Discord.MessageAttachment(Buffer.from(content, 'utf-8'), 'message.txt') ] })
            break;
            case "this":
            const id = message?.channel?.topic?.slice(3);
            if(!id)return bot.shortMessage(message, 'This is not a modmail thread channel.', 'error', { name: 'Invalid Channel' });
            const user = await bot.client.users.cache.get(id);
            const dt = await bot.getLogsByUserId(user.id);
            var ct = ''; var dataCount = 0;
            dt.forEach((e) => {
            dataCount++; ct += `${dataCount}. [\`${e?.Id}\`](${config?.logsURI}/${e?.Id}) - <t:${e?.Timestamp}>\n`;
            });
            if(dataCount < 1)ct += `Couldn't find any records for ${user.tag}`;
            return bot.shortMessage(message, ct, 'custom', { name: `Thread logs for ${user.username}`, icon_url: user.avatarURL() });
            break;
            case "adduser": 
            const usr = await bot.client.users.cache.get(args[1]);
            if(!usr) return bot.shortMessage(message, 'Please provide a valid user ID', 'error', { name: 'Error' });
            if((await bot.getlogViewers())?.includes(usr.id)) return bot.shortMessage(message, 'This user can already view the logs', 'error');
            await bot.addLogViewer(usr.id);
            bot.shortMessage(message, `Successfully added <@!${usr.id}>(${usr.id}) to the logs viewer list.`, 'success', { name: 'Log Viewer Added' });
            break;
            case "removeuser":
            const remUsr = await bot.removelogViewer(args[1]);
            if(!remUsr)return bot.shortMessage(message, 'This user cannot view the logs.', 'error');
            return bot.shortMessage(message, `Successfully removed <@!${args[1]}>(${args[1]}) from the log viewer list.`, 'success', { name: 'Log Viewer Remove' });
            break;
            case "viewers":
           const viewers = await bot.getlogViewers();
           return bot.listingEmbed(message, viewers, "No one can view the logs.", "Logs Viewer");
            break;          
            default:
              if(!args[0])return bot.shortMessage(message, 'Please provide a log ID.', 'error');
              var info = await bot.getLog(args[0]);
              if(!info)return bot.shortMessage(message, 'This log doesn not exist.', 'error', { name: 'Error' });
              return bot.shortMessage(message, `**User ID:** \`${info.User}\`\n**Channel ID:** \`${info.Channel}\``, 'custom', { name: 'Modmail Log', url: `${config?.logsURI}/${info.Id}` })
        }
    }
}
