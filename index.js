require("dotenv").config();
const express = require("express");
const request = require("request");
const cheerio = require("cheerio");
const app = express();
const Database = require("@replit/database");
const port = 3000;

const db = new Database();

app.get("/", (req, res) => res.send("Hello World!"));

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);

function updatedb(id, codId) {
  db.set(id, codId);
}

function deletedb(id){
  db.delete(id).then(() => {
  });
}


// ================= START BOT CODE ===================
const Discord = require("discord.js");
const client = new Discord.Client();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message",async (msg) => {
  console.log(msg.content);

  if (msg.content.startsWith("$user")){
    message = msg.content.split(" ");
    db.get(message[1]).then(value => {
      msg.channel.send(value);
    })
  }  

  if (msg.content.startsWith("$kd")){
    message = msg.content.split(" ");
    if(!message[1]){
      msg.reply("HPTA TONTO")
    }else{
      db.get(message[1]).then(value => {
        var id = "";
        if(value){
          id = value; 
        }else{
          id = message[1];
        }
        (() => {
          console.log(id)
          id = id.replace(/\s/g, "");
          id = id.replace(/\#/g, "%23");
          console.log(id);
          const url = [
            "https://cod.tracker.gg/warzone/profile/atvi/",
            id,
            "/overview",
          ].join("");
          
          const customHeaderRequest = request.defaults({
            headers: {
              "User-Agent":
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
            },
          });
          
          //const names = ["Wins", "Top 5", "K/D", "Damage/game"]
          customHeaderRequest.get(url, function (err, resp, body) {
            if (err) {
              console.log(err);
            }
            $ = cheerio.load(body);
            let data = new Array(); 
          
            $(".giant-stats .stat").each((i,elem) => {
              data.push($(elem).find(".value").text());
            });
            try{
              msg.channel.send(data[2])
            }
            catch{
              msg.channel.send("HPTA HAY UN BUG")
            }
          });
          })();
      })
    }
  }

  
  if (msg.content.startsWith("$new")) {
    message = msg.content.split(" ");
    if(!message[1] || !message[2]){
      msg.reply("HPTA TONTO");
      msg.reply("$new id idCodTraker")
    }else{
      console.log("entro")
      updatedb(message[1], message[2]);
    }
  }

  if (msg.content.startsWith("$del")){
    message = msg.content.split(" ");
    deletedb(message[1]);
  }
  //if (msg.content === "$list") {
  //  db.list().then(keys. => {
  //    console.log(elem)
  //    db.get(elem).then(value => {
  //      console.log(value)
  //      try{
  //        msg.channel.send(elem + " " + value);
  //      }
  //      catch{
  //        msg.channel.send("HPTA UN BUG");
  //      }
  //    });
  //    
  //  });
  //}
});

console.log(process.env.DISCORD_TOKEN);
client.login(process.env.DISCORD_TOKEN);
