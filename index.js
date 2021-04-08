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

app.get("/", (req, res) => res.send("Hello World!"));

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);

function deletedb(id) {
  db.delete(id).then(() => {});
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
  //const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === "user") {
    msm = prettier(msg.content.toLowerCase().trim());
    message = msm.split(" ");
    db.get(message[1]).then((value) => {
      msg.channel.send(value);
    });
  }

  if (command === "new") {
    if(!args[0]) {message.channel.send('Enter @Username'); return;}
    if(!args[1]) {message.channel.send("Enter wzId"); return;}
    args[0] = prettier(args[0]);
    msg.channel.send("Registrado con Exito");
    db.set(args[0], args[1]);
  }

  //if (command === "get") {
  //  message = msg.content.split(" ");
  //  db.get(message[1]).then((value) => {
  //    console.log(value);
  //    msg.channel.send(value);
  //  });
  //}

  //if (command === "list") {
  //  db.list().then((keys) => {
  //    console.log(typeof keys);
  //    console.log(keys);
  //    console.log(keys[0]);
  //    for (const [key, value] of Object.entries(keys)) {
  //      db.get(value).then((value) => {
  //        msg.channel.send(value);
  //      });
  //      console.log(`${key}: ${value}`);
  //    }
  //  });
  //}

  if(command === 'ping') {
    // Round-trip latency AND average latency between bot and websocket server (one-way)
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
  }

  // Call of Duty API - Dirty Hack <3
  if(command === 'cod') {
  	if(!args[0]) {message.channel.send('Enter a gamertag/player name'); return;}
  	if(!args[1]) {message.channel.send("Enter a platform (psn, xbl, battle, acti,...)"); return;}
    const m = await message.channel.send("Loading...");
    try {
      await codAPI.login(COD_USERNAME, COD_PASSWORD);
      let data = await codAPI.MWwz(args[0], args[1]);

      const embed = new MessageEmbed()
      .setColor('F6FF33')
      .setThumbnail('https://d1yjjnpx0p53s8.cloudfront.net/styles/logo-thumbnail/s3/032020/call_of_duty_warzone.jpg')
      .setTitle('COD Warzone')
      .setDescription('Battle Royal overview:')
      //.addField('\u200B', '\u200B')
      .addField(`> ${args[0]}`, '\u200B', false)
      .addFields(
          {name: 'Wins', value: data.lifetime.mode.br.properties.wins, inline: true},
          {name: 'K/D ratio', value: (data.lifetime.mode.br.properties.kdRatio).toFixed(2), inline: true},
          {name: 'Time Played', value: (parseFloat(data.lifetime.mode.br.properties.timePlayed) / 3600).toFixed(2) + 'hrs', inline: true},
          {name: 'Games Played', value: data.lifetime.mode.br.properties.gamesPlayed, inline: true},
          {name: 'Top 5', value: data.lifetime.mode.br.properties.topFive, inline: true},
          {name: 'Top 10', value: data.lifetime.mode.br.properties.topTen, inline: true},
          //{name: 'Kills', value: data.lifetime.mode.br.properties.kills, inline: true},
          )
      //.addField('\u200B', '\u200B')
      //.setFooter("❔ - Type '+help' for more information")
      message.channel.send(embed);
      m.delete().catch(console.error);
    } catch(error) {
      m.delete().catch(console.error);
      console.log("error :(")
      message.channel.send("Couldn't load player data.");
    }
  }

  if(command === 'kd') {
    if(!args[0]) {message.channel.send('Enter @Username'); return;}
    const m = await message.channel.send("Loading...");
    db.get(args[0]).then((value) => {
      args[0] = value;
    })
    try {
      await codAPI.login(COD_USERNAME, COD_PASSWORD);
      let data = await codAPI.MWwz(args[0], 'acti');
      const embed = new MessageEmbed()
      .setColor('F6FF33')
      .setThumbnail('https://d1yjjnpx0p53s8.cloudfront.net/styles/logo-thumbnail/s3/032020/call_of_duty_warzone.jpg')
      .setTitle('COD Warzone')
      .setDescription('Battle Royal overview:')
      //.addField('\u200B', '\u200B')
      .addField(`> ${args[0]}`, '\u200B', false)
      .addFields(
          {name: 'Wins', value: data.lifetime.mode.br.properties.wins, inline: true},
          {name: 'K/D ratio', value: (data.lifetime.mode.br.properties.kdRatio).toFixed(2), inline: true},
          {name: 'Time Played', value: (parseFloat(data.lifetime.mode.br.properties.timePlayed) / 3600).toFixed(2) + 'hrs', inline: true},
          {name: 'Games Played', value: data.lifetime.mode.br.properties.gamesPlayed, inline: true},
          {name: 'Top 5', value: data.lifetime.mode.br.properties.topFive, inline: true},
          {name: 'Top 10', value: data.lifetime.mode.br.properties.topTen, inline: true},
          //{name: 'Kills', value: data.lifetime.mode.br.properties.kills, inline: true},
          )
      //.addField('\u200B', '\u200B')
      //.setFooter("❔ - Type '+help' for more information")
      message.channel.send(embed);
      m.delete().catch(console.error);
    } catch(error) {
      m.delete().catch(console.error);
      console.log("error :(")
      message.channel.send("Couldn't load player data.");
    }
  }

  if(command === 'top') {
  }

});

client.login(token);
