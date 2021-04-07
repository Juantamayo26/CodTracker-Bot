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
const Discord = require("discord.js");
const client = new Discord.Client();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (msg) => {
  console.log(msg.content);

  if (msg.content.toLowerCase().startsWith("user")) {
    msm = prettier(msg.content.toLowerCase().trim());
    message = msm.split(" ");
    db.get(message[1]).then((value) => {
      msg.channel.send(value);
    });
  }

  if (msg.content.toLowerCase().startsWith("kd")) {
    var id = "";
    msm = prettier(msg.content.toLowerCase().trim());
    message = msm.split(" ");
    if (message[1] === "me") {
      message[1] = msg.author.id;
    }
    if (!message[1]) {
      msg.reply("HPTA TONTO");
    } else {
      db.get(message[1]).then((value) => {
        if (value) {
          id = value;
        } else {
          id = message[1];
        }
        (() => {
          console.log(id);
          id = id.replace(/\s/g, "");
          id = id.replace(/\#/g, "%23");
          console.log(id);
          const url = [
            "https://cod.tracker.gg/warzone/profile/atvi/",
            id,
            "/overview",
          ].join("");
          console.log(url);

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

            $(".main .stat").each((i, elem) => {
              data.push($(elem).find(".value").text());
            });
            if (data[18]) {
              msg.channel.send(data[18]);
            } else {
              msg.channel.send("HPTA HAY UN BUG");
            }
          });
        })();
      });
    }
  }

  if (msg.content.toLowerCase().startsWith("new")) {
    msm = prettier(msg.content.toLowerCase().trim());
    message = msm.split(" ");
    if (!message[1] || !message[2]) {
      msg.reply("HPTA TONTO");
      msg.reply("$new @NickName(discord) idCodTraker#");
    } else {
      msg.channel.send("Registrado con Exito");
      updatedb(message[1], message[2]);
    }
  }

  if (msg.content.toLowerCase().startsWith("del")) {
    //msm = prettier(msg.content.toLowerCase().trim());
    message = msg.content.split(" ");
    console.log(message);
    deletedb(message[1]);
  }
  if (msg.content.startsWith("get")) {
    message = msg.content.split(" ");
    db.get(message[1]).then((value) => {
      console.log(value);
      msg.channel.send(value);
    });
  }
  if (msg.content === "list") {
    db.list().then((keys) => {
      console.log(typeof keys);
      console.log(keys);
      console.log(keys[0]);
      for (const [key, value] of Object.entries(keys)) {
        db.get(value).then((value) => {
          msg.channel.send(value);
        });
        console.log(`${key}: ${value}`);
      }
    });
  }

  if (msg.content === "top") {
    db.list().then((keys) => {
      let kd = [];
      for (const [key, value] of Object.entries(keys)) {
        db.get(value).then((value) => {
          (async () => {
            id = value;
            id = id.replace(/\s/g, "");
            id = id.replace(/\#/g, "%23");
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
            customHeaderRequest.get(
              url,
              await function (err, resp, body) {
                if (err) {
                  console.log(err);
                }
                $ = cheerio.load(body);
                let data = new Array();

                $(".main .stat").each((i, elem) => {
                  data.push($(elem).find(".value").text());
                });
                if (data[18]) {
                  msg.channel.send(`${value}: ${data[18]}`);
                  kd.push(data[18]);
                } else {
                  msg.channel.send("HPTA HAY UN BUG");
                }
              }
            );
            console.log(kd);
          })();
        });
      }
      console.log(kd);
    });
  }
});

console.log(process.env.DISCORD_TOKEN);
client.login(process.env.DISCORD_TOKEN);
