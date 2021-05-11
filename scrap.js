const request = require("request");
const cheerio = require("cheerio");

var id = "ByPiglet #2087417";
id = id.replace(/\s/g, "");
id = id.replace(/\#/g, "%23");

const url = [
  "https://cod.tracker.gg/warzone/profile/atvi/",
  id,
  "/matches",
].join("");

const customHeaderRequest = request.defaults({
  headers: {
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
  },
});

const getData = () =>
  new Promise((resolve, reject) => {
    customHeaderRequest.get(url, async function (err, resp, body) {
      if (err) {
        reject(err);
      }
      let data = new Array();
      $ = cheerio.load(body);
      setTimeout(function () {
        $(".session-header").each((i, elem) => {
          console.log("HOLA");
          data.push($(elem).find(".session-header__value").text());
        });
        resolve(data);
      }, 2000);
    });
  });

getData().then((data) => console.log(data));
