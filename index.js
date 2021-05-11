const codAPI = require('call-of-duty-api')();
require("dotenv").config();
const Discord = require("discord.js");
const sqlite = require('sqlite3').verbose();

// CONFIG
const token = process.env.TOKEN;
const prefix = "";
const COD_USERNAME = process.env.COD_USERNAME;
const COD_PASSWORD = process.env.COD_PASSWORD;

function toDateTime(secs) {
  var t = new Date(Date.UTC(1970, 0, 1)); // Epoch
  t.setUTCSeconds(secs);
  return t;
}

const isToday = (someDate, lastGame) => {
  return someDate.getDate() == lastGame.getDate() &&
    someDate.getMonth() == lastGame.getMonth() &&
    someDate.getFullYear() == lastGame.getFullYear()
}

async function getData(id){
  let data = new Object()
  await codAPI.login(COD_USERNAME, COD_PASSWORD);
  let data1 = await codAPI.MWBattleData(id, 'acti');
  let data2 = await codAPI.MWcombatwz(id, 'acti');
  let kills = 0
  let deaths = 0
  const lastGame = toDateTime(data2.matches[0].utcStartSeconds)
  data2.matches.forEach((i) => {
    if(isToday(toDateTime(i.utcStartSeconds), lastGame) && i.gameType === 'wz'){
      kills+= i.playerStats.kills;
      deaths+= i.playerStats.deaths;
    }
  })

  data.wins = data1.br.wins
  data.kills = data1.br.kills
  data.timePlayed = (parseFloat(data1.br.timePlayed) / 3600).toFixed(2)+'hrs'
  data.gamesPlayed = data1.br.gamesPlayed 
  data.globalKd = data1.br.kdRatio.toFixed(2)
  data.date1 = lastGame
  data.dailyKd = (kills/deaths).toFixed(2)
  return data
}


function prettier(msm) {
  msm = msm.replace(/\>/g, " ");
  msm = msm.replace(/\</g, "");
  msm = msm.replace(/\>/g, "");
  msm = msm.replace(/\@/g, "");
  msm = msm.replace(/\!/g, "");
  msm = msm.replace(/ +(?= )/g, "");
  return msm;
}

// ================= START BOT CODE ===================


const client = new Discord.Client();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  let db = new sqlite.Database('./db/users.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);
  db.run(`CREATE TABLE IF NOT EXISTS user(userid INTEGER NOT NULL, usercod TEXT NOT NULL)`)
});


client.on("message", async (message) => {
  if(message.author.bot) return;
  const args = message.content.replace(/ +(?= )/g, "").slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  let db = new sqlite.Database('./db/users.db', sqlite.OPEN_READWRITE);

  if (command === "new") {
    if(!args[0]) {message.channel.send('Enter @Username'); return;}
    if(!args[1]) {message.channel.send("Enter wzId"); return;}
    args[0] = prettier(args[0]);
    let insertdata = db.prepare(`INSERT INTO user VALUES(?,?)`);
    insertdata.run(args[0], args[1]);
    insertdata.finalize();
    db.close();
    message.channel.send("Registrado con Exito");
    console.log(args[0], args[1])
  }

  if(command === 'kd') {
    if(!args[0]) {message.channel.send('Enter @Username'); return;}
    if (args[0] === "me") {
      args[0] = message.author.id;
    }
    let query = `SELECT * FROM user WHERE userid = ?`;
    db.get(query, [prettier(args[0])], (err, data) => {
      if(err) console.log(err)
      if (data === undefined) {
        console.log('hola')
      }else{
        (async () => {
          const m = await message.channel.send("Loading...");
          //console.log(await getData('srios1899#9255577'))
          const info = await getData(data.usercod)
          const embed = new Discord.MessageEmbed()
          .setColor('F6FF33')
          .setThumbnail('https://d1yjjnpx0p53s8.cloudfront.net/styles/logo-thumbnail/s3/032020/call_of_duty_warzone.jpg')
          .setTitle('COD Warzone')
          .setDescription('Warzone overview:')
          .addField(`> ${data.usercod}`, '\u200B', false)
          .addFields(
            {name: 'Wins', value: info.wins, inline: true},
            {name: 'Global K/D', value: info.globalKd , inline: true},
            {name: 'Time Played', value: info.timePlayed, inline: true},
            
            {name: 'Games Played', value: info.gamesPlayed, inline: true},
            {name: 'Daily K/D', value: info.dailyKd, inline: true},
            {name: 'Kills', value: info.kills, inline: true},
          )
          message.channel.send(embed);
          m.delete().catch(console.error);
        })();
      }
    })
  }
})

//const kdUpgrade = setInterval(async () => {
//  await codAPI.login(COD_USERNAME, COD_PASSWORD)
//  keys = await db.list()
//  keys.forEach(async (i) => {
//    let value = await db.get(i)
//    try{
//      let data = await codAPI.MWwz(value, 'acti');
//      let kdNew = data.lifetime.mode.br.properties.kdRatio.toFixed(2)
//      let kdOld = await db.get(value)
//      if(kdOld == null){
//        console.log("HOLA")
//        await db.set(value, kd)
//      }else if( kdNew != kdOld ){
//        console.log(value)
//        console.log(kdNew)
//        console.log(kdOld)
//      }
//    }catch{
//    }
//  })
//}, 1000 * 60 * 60 * 24)

client.login(token);
