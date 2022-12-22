const { config } = require('./config');
const { EmbedBuilder } = require('discord.js');

const errors = {
    throwError: (error) => { if(!error)return; throw new Error(`${error}`); },
    provide: (value) => errors.throwError(`Please provide a ${value}`),
    check: () => {
      if(typeof config?.token != 'string') return errors.provide('valid token');
      if(typeof config?.databaseURI != 'string') return errors.provide('valid database URI');
      if(typeof config?.guildID != 'string')return errors.provide('valid guildID');
      if(typeof config?.roleID != 'string')return errors.provide('valid role ID');
      if(typeof config?.category != 'string')return errors.provide('valid category ID');
      if(typeof config?.prefix != 'string')return errors.provide('valid prefix');
      if(config?.activity && typeof config?.activity != 'string')return errors.provide('valid bot status (activity)');
      if(config?.logThreads == true && !config?.logsURI)return errors.provide('valid modmail logs URI');
      if(config?.port && typeof config?.port != 'number')return errors.provide('valid port');
      if(!config?.colors?.primary)return errors.provide('primary color');
      if(!config?.colors?.success)return errors.provide('success color');
      if(!config?.colors?.error)return errors.provide('error color');
      if(!config?.colors?.custom)return errors.provide('custom color');
    },
    reply: (message, value) => message.reply({ embeds: [new EmbedBuilder().setDescription(`${value}`).setColor(`${config?.colors?.error}`)] }),
    exceedLimit: (message, value, max) => errors.reply(message, `${value} cannot be longer than ${max} characters.`),
    provideAValue: (message) => errors.reply(message, 'Please provide a value.'),
    provideATag: (message) => errors.reply(message, 'Please provide a tag name.'),
    tagDoesNotExist: (message) => errors.reply(message, 'This tag does not exist.')
};
module.exports = errors;
