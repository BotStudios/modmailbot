const { version } = require('./../package.json');
module.exports = {
    version,
    databaseURI: '', // *
    token: '', // *
    guildID: '', // *
    category: '', // *
    roleID: '', // *
    prefix: '',  // *
    logThreads: true,
    threadCloseDelay: 2500,
    customReply: false,
    notifyMsg: '',
    webhookURI: '',
    activity: '',
    logsURI: '',
    colors: { 
        success: '', // *
        error: '', // *
        primary: '', // *
        custom: '' // *
    }
}
