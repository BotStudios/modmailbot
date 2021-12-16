const config = require('./config.js');
const mongoose = require('mongoose');
const { EventEmitter } = require('node:events');
const uniqBy = require('lodash/uniqBy');
const error = require('./errors.js');

class Utils extends EventEmitter {
    constructor(Discord, client, collection) {
        super();
        this.client = client;
        this.Discord = Discord;
        this.collection = collection;
        this._ = uniqBy;
        this.error = error;         
        this.config = config;
        this.settings = mongoose.model("modmail_settings", new mongoose.Schema({ tags: Object, blocked: Array }));
        this.model = mongoose.model("modmail", new mongoose.Schema({ User: String, Channel: String, Messages: Array }));
        this.logs = mongoose.model("modmail_logs", new mongoose.Schema({ Id: String, Channel: String, User: String, Timestamp: Number, Messages: Array }));
    }

    async ready() { 
        await mongoose.connect(config.databaseURI, { useUnifiedTopology: true, useNewUrlParser: true });
        this.getThreads().then((data) => {
            this._(data, 'User').forEach((x) => {
                      this.collection.set(x.User, x);
                  });
        }); 
        this.emit('ready');
    }
   
    async shortMessage(message, msg, color = 'RANDOM', author = {}) {
      if(!message || !msg)return;
      message.reply({ embeds: [{ description: `${msg}`, color: `${config?.colors[color]}`, author }] })
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
        await this.client.channels.cache.get(data.Channel).delete();
        const threadId = this.generate();
        if(config?.logThreads == true) { 
            await this.newLog({
                Id: threadId,            
                User: data?.User,
                Channel: data?.Channel, 
                Messages: data?.Messages,
                Timestamp: ''
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

}

module.exports = Utils;
