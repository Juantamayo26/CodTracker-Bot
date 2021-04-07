const request = require("request");
const cheerio = require("cheerio");

var id = "ByPiglet #2087417";
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
    //data.push({
    //  data: $(elem).find(".value").text(),
    //});
  });
  console.log(data);
});
