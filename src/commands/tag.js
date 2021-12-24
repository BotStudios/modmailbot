module.exports = {
    name: 'tag',
    description: '',
    run: async ({  bot, data, config, message, args }) => {
        if(!args[0])return bot.error.provideATag(message);
        switch(args[0]) {
            case "create":
             if(!args[1])return bot.error.provideATag(message);
             if(!args[2])return bot.error.provideAValue(message);
             if(args[1].length > 20)return bot.error.exceedLimit(message, 'Tag name', 20);
             var tagValue = args?.splice(2)?.join(" ")
             if(tagValue > 500 || tagValue < 1)return bot.error.exceedLimit(message, 'Tag value', 500);
             await bot.createTag(args[1], tagValue);
             return bot.shortMessage(message, await bot.getTag(args[1]), 'custom', { name: `Snippet for ${args[1]}` }).catch(console.log)
             break;
             case "delete":
             if(!args[1])return bot.error.provideATag(message);
             const wasDeleted = await bot.deleteTag(args[1]);    
             if(!wasDeleted)return bot.error.tagDoesNotExist(message);
             return bot.shortMessage(message, `**${args[1]}** was removed from the tag list.`, 'error');  
             break;       
             default: 
             var info = await bot.getTag(args[0]);
             if(!info)return bot.shortMessage(message, `This log does not exist.`, 'error');
             return bot.shortMessage(message, info, 'custom', { name: `Snippet for ${args[0]}` });
             
 
         }
    }
}
