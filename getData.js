import API from 'call-of-duty-api'
const codAPI = API()
//const codAPI = require('call-of-duty-api')();
const COD_USERNAME = process.env.COD_USERNAME;
const COD_PASSWORD = process.env.COD_PASSWORD;

function toDateTime(secs) {
  var t = new Date(Date.UTC(1970, 0, 1)); // Epoch
  t.setUTCSeconds(secs);
  return t;
}

const isToday = (someDate) => {
  const today = new Date()
  return someDate.getDate() == today.getDate() &&
    someDate.getMonth() == today.getMonth() &&
    someDate.getFullYear() == today.getFullYear()
}

async function getData(id){
  await codAPI.login(COD_USERNAME, COD_PASSWORD);
  //let data = await codAPI.MWwz(id, 'acti');
  let data4 = await codAPI.MWcombatwz(id, 'acti');
  let kills = 0
  let deaths = 0
  data4.matches.forEach((i) => {
    if(isToday(toDateTime(i.utcStartSeconds)) && i.gameType === 'wz'){
      kills+= i.playerStats.kills;
      deaths+= i.playerStats.deaths;
    }
  })
  return (kills/deaths).toFixed(2)
}

export default getData; 
