var utils;
var database;
module.exports = (util) =>  {  utils = util; database = util.logs };
const express = require('express');
const app = express();
const config = require('./../config');
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.enable('trust proxy'); 
app.set('views', path.join(__dirname, 'views'));

app.get('/:id/raw', async (req,res) => {
    const data = await database.findOne({ Id: req.params.id });
    if(!data)return res.json({ message: 'This log does not exist.' });
    res.json({
       Id: data.Id,
       User: data.User,
       Channel: data.Channel,
       Messages: data.Messages
    });
})

app.get('/:id', async (req,res) => {
    const data = await database.findOne({ Id: req.params.id });
    if(!data)return res.json({ message: 'This log does not exist.' });
    var content = '';
    data?.Messages?.forEach((e) => {
     for(i in e) {
      content += `
      <div class="message-group hide-overflow">
      <div class="avatar-large" style="background-image: url(${e[i].avatar})"></div>
      <div class="comment">
          <div class="message" style="height: 25px;">
             <strong class="username">${i}</strong>
                  <span class="timestamp">${e[i].timestamp}</span>
          </div>
          ${e[i].content}
      </div>
  </div>
      `
}

    })
    res.render('log', { content });
})
app.listen(config?.port, () => {
    utils.emit('serverReady', {
        message: `Modmail logs listening on PORT ${config?.port}`,
        port: config?.port  
      });
});   
