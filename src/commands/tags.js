module.exports = {
    name: 'tags',
    description: 'View a list of created tags/snippets',
    run: async ({ bot, config, message, args }) => {
        var embed = new bot.Discord.MessageEmbed().setAuthor('Snippets'); 
        var tags = ""; var tagCount = 0;
        const data = await bot.getTags(); 
        for(var i in data) { tagCount++; tags += `${tagCount}. ${i}\n`; }
        if(tagCount == 0) tags += `The tag list was empty at the moment`;
        embed.setDescription(tags).setColor('RANDOM'); message.reply({ embeds: [embed] });
    }
}
