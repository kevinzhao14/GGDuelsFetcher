/**
 * Info for ID fetching:
 */
const selfId = "";

// Artificial delay to not overload API
function promisedTimeout(func, time) {
  return new Promise((resolve) => {
      setTimeout(() => {
          resolve(func());
      }, time);
  });
}

// parse IDs from API string
function getDuelIDs(str) {
  return [...str.matchAll(/\\"gameId\\":\\"([\w\d\-]*)\\",\\"gameMode\\":\\"Duels\\"/g)].map(v => v[1]);
}

// build pagination key for API
function buildPagination(date) {
  return btoa(`{"HashKey":{"S":"${selfId + "_activity"}"},"Created":{"S":"${date}"}}`);
}

// fetch duel IDs from activity pages
async function getAllDuels(maxPages=1, mostRecentId="", start="") {
  let pagination = start;
  const duelIds = [];
  for (let pages = 0; pages < maxPages; pages++) {
    console.log("Fetching page", (pages + 1));

    let url = "https://www.geoguessr.com/api/v4/feed/private";
    if (pagination !== "") {
      url += "?paginationToken=" + pagination;
    }

    // fetch and parse data
    let data = await fetch(url);
    data = await data.text();
    let parsed = JSON.parse(data);

    if (parsed.entries.length === 0) {
      console.log("All data fetched.");
      break;
    }

    duelIds.push(...getDuelIDs(data));

    if (duelIds.includes(mostRecentId)) {
      break;
    }
    
    pagination = buildPagination(parsed.entries[parsed.entries.length - 1].time.substring(0, 23) + "Z");

    await promisedTimeout(() => console.log("Done"), 500);
  }

  let uniqueIds = duelIds.filter((v, i, a) => a.indexOf(v) === i);

  if (!uniqueIds.includes(mostRecentId)) {
    return uniqueIds;
  } else {
    return uniqueIds.slice(0, uniqueIds.indexOf(mostRecentId));
  }
}

await getAllDuels(1000);







/**
 * IDs fetched from the previous step
 */
const ids = [];

// parse duel data into raw data to be used
function parseDuelData(data) {
  const res = {};

  res.id = data.gameId;
  res.rounds = data.currentRoundNumber;
  res.startDate = (new Date(data.rounds[0].startTime)).toLocaleString("en-US");
  res.endDate = (new Date(data.rounds[res.rounds - 1].endTime)).toLocaleString("en-US");

  for (let i in [0, 1]) {
    let team = data.teams[i];
    if (team.players[0].playerId === selfId) {
      res.selfHp = team.health;

      console.log('t', team);
      if (team.players[0].progressChange === null) {
        res.befElo = team.players[0].rating;
        res.aftElo = res.befElo;
      } else {
        const rating = team.players[0].progressChange.competitiveProgress;
        if (rating === null) {
          res.befElo = team.players[0].rating;
          res.aftElo = res.befElo;
        } else {
          res.befElo = rating.ratingBefore;
          res.aftElo = rating.ratingAfter;
        }
      }

      [res.selfDist, res.selfTtg, res.selfCountries] = S(team.players[0].guesses, data.rounds, team.roundResults, data.teams[1 - i].roundResults);
    } else {
      res.oppId = team.players[0].playerId;
      res.oppHp = team.health;
      res.oppElo = team.players[0].rating;

      [res.oppDist, res.oppTtg, blank] = S(team.players[0].guesses, data.rounds);
    }
  }
  return res;
}

// calculate guess statistics (distance, time to guess)
function S(guesses, rounds, results=null, opp=null) {
  let dist = 0;
  let ttg = 0;
  let count = 0;
  let countries = {};
  for (const guess of guesses) {
    let rn = guess.roundNumber - 1;
    let time = ((new Date(guess.created)) - (new Date(rounds[rn].startTime))) / 1000;
    count++;
    dist += guess.distance;
    ttg += time;

    if (!results) continue;

    let country = rounds[rn].panorama?.countryCode;
    if (country === "") {
      continue;
    }
    if (!(country in countries)) {
      countries[country] = [0,0,0,0,0,0]; // # rounds, total distance, total time-to-guess, # rounds won, score diff on lost rounds, score diff
    }
    // # rounds
    countries[country][0]++;
    // distance
    countries[country][1] += guess.distance;
    // time
    countries[country][2] += time;
    if (results[rn].healthAfter >= results[rn].healthBefore) {
      // rounds won
      countries[country][3]++;
    } else {
      countries[country][4] += opp[rn].score - results[rn].score;
    }
    countries [country][5] += results[rn].score - opp[rn].score;
    // else if (rn < num - 1) {
    //   // damage dealt on lost rounds
    //   countries[country][4] += damage / rounds[rn].damageMultiplier;
    // }

  }
  if (count === 0) {
    return ["", ""];
  }
  return [dist / count, ttg / count, Object.entries(countries).map(e => e[0] + "," + e[1].join(",")).join(";")];
}

// fetch duel data from API and process
async function getDuelData(duels) {
  duelData = [];

  let i = 0;

  for (const id of duels.slice(0, 2000)) {
    console.log("Fetching duel #" + (i++));

    let info = await fetch("https://game-server.geoguessr.com/api/duels/" + id);
    info = await info.json();

    duelData.push(parseDuelData(info));

    await promisedTimeout(() => null, 150);
  }

  return duelData;
}

const h = {
  id: "ID", 
  rounds: "# Rounds",
  startDate: "Start Date", 
  endDate: "End Date",
  selfHp: "My Health", 
  befElo: "Start ELO", 
  aftElo: "End ELO",
  selfDist: "Avg Distance",
  selfTtg: "Avg TTG",
  oppId: "Opp ID",
  oppHp: "Opp Health", 
  oppElo: "Opp ELO", 
  oppDist: "Opp Distance",
  oppTtg: "Opp TTG"
};

// parse raw data to CSV format
function P(data, delim="\t", headers=h) {
  let parsed = "";
  data = [headers, ...data];
  for (const row of data) {
    for (const name in headers) {
      parsed += row[name] + delim
    }
    parsed += "\n";
  }
  return parsed;
}

// run
let data = await getDuelData(ids);
P(data);