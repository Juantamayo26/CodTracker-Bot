require("dotenv").config();

const Discord = require("discord.js");
const express = require("express");
const request = require("request");
const cheerio = require("cheerio");
const Database = require("@replit/database");
const codAPI = require('call-of-duty-api')();

const app = express();
const db = new Database();


// CONFIG
const token = process.env.TOKEN;
const prefix = "";
const COD_USERNAME = process.env.COD_USERNAME;
const COD_PASSWORD = process.env.COD_PASSWORD;
const port = 3000;

const customHeaderRequest = request.defaults({
  headers: {
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
  },
});



app.get("/", (req, res) => res.send("Hello World!"));

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);

function deletedb(id) {
  db.delete(id).then(() => {
    console.log("YES")
  });
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
});

client.on("message", async (message) => {
  
  // prevent "botception"
  if(message.author.bot) return;

  const args = message.content.replace(/ +(?= )/g, "").slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === "user") {
    args[0] = prettier(args[0]);
    db.get(args[0]).then((value) => {
      if(value){
        message.channel.send(value);
      }else{
        message.channel.send("Couldn't load data.");
      }
    });
  }

  if (command === "new") {
    if(!args[0]) {message.channel.send('Enter @Username'); return;}
    if(!args[1]) {message.channel.send("Enter wzId"); return;}
    args[0] = prettier(args[0]);
    message.channel.send("Registrado con Exito");
    await db.set(args[0], args[1]);
  }

  if(command === 'ping') {
    // Round-trip latency AND average latency between bot and websocket server (one-way)
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
  }

  if(command === 'kd') {
  }

  if(command === 'kd') {
    if(!args[0]) {message.channel.send('Enter @Username'); return;}
    if (args[0] === "me") {
      args[0] = message.author.id;
    }
    const id = await db.get(prettier((args[0])))
    id == null?args[0]:id;
    (async () => {
      const m = await message.channel.send("Loading...");
      await codAPI.login(COD_USERNAME, COD_PASSWORD);
      let data = await codAPI.MWwz(id, 'acti');
      var id2 = id.replace(/\s/g, "");
      id2 = id2.replace(/\#/g, "%23");

      const url = [
        "https://cod.tracker.gg/warzone/profile/atvi/",
        id,
        "/detailed",
      ].join("");

      const url2 = [
        "https://cod.tracker.gg/warzone/profile/atvi/",
        id,
        "/matches",
      ].join("");

      customHeaderRequest.get(url, function (err, resp, body) {
        if (err) {
          console.log(err);
        }
        $ = cheerio.load(body);
        let data = new Array();
        $(".main .stat").each((i, elem) => {
          data.push($(elem).find(".value").text());
        })

        const embed = new Discord.MessageEmbed()
        .setColor('F6FF33')
        .setThumbnail('https://d1yjjnpx0p53s8.cloudfront.net/styles/logo-thumbnail/s3/032020/call_of_duty_warzone.jpg')
        .setTitle('COD Warzone')
        .setDescription('Warzone overview:')
        .addField(`> ${value}`, '\u200B', false)
        .addFields(
          {name: 'Wins', value: data.lifetime.mode.br.properties.wins, inline: true},
          {name: 'K/D ratio', value: (data.lifetime.mode.br.properties.kdRatio).toFixed(2), inline: true},
          {name: 'Time Played', value: (parseFloat(data.lifetime.mode.br.properties.timePlayed) / 3600).toFixed(2) + 'hrs', inline: true},
          
          {name: 'Games Played', value: data.lifetime.mode.br.properties.gamesPlayed, inline: true},
          {name: 'Top 5', value: data.lifetime.mode.br.properties.topFive, inline: true},
          {name: 'Top 10', value: data.lifetime.mode.br.properties.topTen, inline: true},
        )
        message.channel.send(embed);
        m.delete().catch(console.error);
      });

      })();

client.login(token);
