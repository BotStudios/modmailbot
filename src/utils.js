const { config } = require('./config.js');
const mongoose = require('mongoose');
const { EventEmitter } = require('node:events');
const uniqBy = require('lodash/uniqBy');
const error = require('./errors.js');
const Discord = require('discord.js');
const fs = require('fs');

class Utils extends EventEmitter {
    constructor(client, collection) {
        super();
        this.client = client;
        this.collection = collection;
        this._ = uniqBy;
        this.error = error;         
        this.config = config;
        this.Discord = Discord;
        this.commands = new Discord.Collection();
        this.commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
        this.settings = mongoose.model("modmail_settings", new mongoose.Schema({ tags: Object, blocked: Array, logViewers: Array }));
        this.model = mongoose.model("modmail", new mongoose.Schema({ User: String, Channel: String, Messages: Array }));
        this.logs = mongoose.model("modmail_logs", new mongoose.Schema({ Id: String, Channel: String, User: String, CloseAt: Date, Messages: Array }));
        this.reservedCommand = [];
    }


    async ready() { 
        await mongoose.connect(config.databaseURI, { useUnifiedTopology: true, useNewUrlParser: true });
        this.getThreads().then((data) => {
            this._(data, 'User').forEach((x) => {
                      this.collection.set(x.User, x);
                  });
        }); 
        for (const file of this.commandFiles) { const command = require(`./commands/${file}`); this.commands.set(command.name, command); this.reservedCommand.push(command.name); }
        if(typeof config?.activity == 'string') this.client.user.setActivity(config?.activity);
       this.emit('ready');
    }
   
    async shortMessage(message, msg, color = 'custom', author = {}, footer = {}, title = null, fields) {
      if(!message || !msg)return;
     return message.reply({
        embeds: [ new this.Discord.EmbedBuilder({ author, footer, description: msg, title, fields })
           .setColor(`${config?.colors[color]}`)
       ]
    })
    }

    async listingEmbed(message, data, msg, name) {
     var dataCount = 0; var content = '';
        data?.forEach((e) => {
        dataCount++;
        content += `${dataCount}. <@!${e}> - ${e}\n`;
        });
        if(dataCount < 1) content = `${msg}`;
        return this.shortMessage(message, `${content}`, 'custom', { name });
    }

    async configure() { 
       const settings  = await this.settings.findOne({});
       if(!settings) await this.settings({
        tags: {},
        blocked: []
       }).save().catch(err => {});
       return settings;
    }

    generate() {
    var numbers = '0123456789', letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', rn, rnd = '', len = 10, randomChars = '';
    randomChars += numbers; randomChars+= letters;
    for (var i = 1; i <= len; i++) { rnd += randomChars.substring(rn = Math.floor(Math.random() * randomChars.length), rn + 1); } 
    return rnd;
    }

    async createTag(tag, value) {
      var db = await this.configure();
      if(!tag || !value)return;
      db.tags =  {
          ...db?.tags,
          [`${tag}`]: `${value}`
      };
      this.emit('tagCreate', { tag, value });      
      return await db.save().catch(err => { console.log(err) });
    }

    async deleteTag(tag) {
       var db = await this.configure();
       if(!tag)return;
       var exist = db?.tags[tag] != undefined;
       delete db?.tags[tag];
       await this.settings(db).save().then().catch(err => {
           console.log(err)
       });
       if(exist) this.emit('tagDelete', tag);
       return exist;
    }

    async getTag(tag) {
       var db = await this.configure();
       if(!tag)return null;
       return db?.tags[tag];
    }

    async getTags() {
        var db = await this.configure();
        return db?.tags;
    }

    async getLog(id) {
      return await this.logs.findOne({
          Id: id
      });
    }

    async getLogsByUserId(id) {
        return await this.logs.find({
            User: id
        });
    }

    async newLog(obj) {
      this.emit('logCreate', obj);
      return await this.logs(obj).save();
    }

    async deleteLog(id, author) {
      const deleted = await this.logs.deleteOne({
          Id: `${id}`
      });
      if(deleted.deletedCount < 1)return false;
      this.emit('logDeleted', deleted, author)
      return true;
    }
  
    async getThreadByUserId(userId) {
      return await this.model.findOne({
          User: userId
      })
    }

    async getThreadByChannelId(channel) {
        const data = await this.model.findOne({
            Channel: channel.id
        })
        return data;
    }

    async getThreads() {
        return await this.model.find({ });
    }

    async getThread(obj) {
        return await this.model.findOne(obj).catch(e => {});
    }

    async createThread(props) {
        return await this.model(props).save().catch(err => {});
    }

    async deleteThread(obj, author) {
        try{
        const data = await this.model.findOne(obj);
        this.collection.delete(data.User);
        await this.model.deleteMany({ User: data.User }).catch(err => {});
        const channel = await this.client.channels.cache.get(data.Channel);
        this.emit('threadOnClose', channel, author);
        setTimeout(async () => { await channel.delete().catch(err => {}); }, config?.threadCloseDelay || 2500);
        const threadId = this.generate();
        if(config?.logThreads == true) { 
            await this.newLog({
                Id: threadId,            
                User: data?.User,
                Channel: data?.Channel, 
                CloseAt: new Date(),
                Messages: data?.Messages,
            }); }
        const user = await this.client.users.cache.get(data.User);
        if(config?.webhookURI) {
           const webhook = new this.Discord.WebhookClient({ url: config?.webhookURI });
           if(!webhook) this.emit('error', 'Please provide a valid webhook URI for modmail loggings.');
           webhook.send({
               embeds: [{
                   author: { name: `${user.tag} (${user.id})`, icon_url: `${user.avatarURL()}` },
                   color: config?.colors?.custom,
                   description: `${config?.logThreads == true ? `Thread log: [\`${threadId}\`](${config?.logsURI}/${threadId})` : ''}`,
                   footer: { text: `Thread closed by ${author.tag}`, icon_url: `${author.avatarURL()}` }
               }]
           })
        }
        this.emit('threadClose', user, author);
        }catch(e) {}
        return true;
    }       

    async blockUser(id, author) {
      const db = await this.configure();
      if(db.blocked.includes(id))return false;
      db.blocked.push(id);
      await db.save().catch(err => {});
      this.emit('userBlock', id, author);
      return true;
    }

    async unblockUser(id, author) {
      const db = await this.configure();
      const index = db.blocked.indexOf(id);
      if(index == -1) return false;
      if (index > -1) {
        db.blocked.splice(index, 1);
      }
      await db.save().catch(err => {});
      this.emit('userUnblock', id, author);
      return true;
    }

    async getBlockedUsers(){
      const db = await this.configure();
      return db?.blocked;
    } 

    async addLogViewer(id) {
        const db = await this.configure();
        if(db.logViewers.includes(id))return false;
        db.logViewers.push(id);
        await db.save().catch(err => {});
        this.emit('logViewerAdd', id);
        return true;
      }
  
      async removelogViewer(id) {
        const db = await this.configure();
        const index = db.logViewers.indexOf(id);
        if(index == -1) return false;
        if (index > -1) {
          db.logViewers.splice(index, 1);
        }
        await db.save().catch(err => {});
        this.emit('logViewerRemove', id);
        return true;
      }
  
      async getlogViewers(){
        const db = await this.configure();
        return db?.logViewers;
      } 

}

module.exports = Utils;
