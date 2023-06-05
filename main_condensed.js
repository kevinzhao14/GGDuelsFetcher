/**
 * SCRIPT 1: paste in console at https://www.geoguessr.com/
 */

await(async(d,s,j)=>{let e="",t=[];for(let a=0;a<s&&!t.includes(j);a++){console.log("Fetching page",a+1);let l="https://www.geoguessr.com/api/v4/feed/private";""!==e&&(l+="?paginationToken="+e);let n=await fetch(l),g=JSON.parse(n=await n.text());if(0===g.entries.length){console.log("All data fetched.");break}t.push(...[...n.matchAll(/\\"gameId\\":\\"([\w\d\-]*)\\",\\"gameMode\\":\\"Duels\\"/g)].map(e=>e[1])),e=btoa(`{"HashKey":{"S":"${d+"_activity"}"},"Created":{"S":"${g.entries[g.entries.length-1].time.substring(0,23)+"Z"}"}}`),await new Promise(e=>{setTimeout(()=>{e()},500)})}t=t.filter((v,i,a)=>a.indexOf(v)===i);return t.includes(j)?t.slice(0,t.indexOf(j)):t})("--->YOUR ID HERE<---",100);




/**
 * SCRIPT 2: paste in console at https://game-server.geoguessr.com/
 */

const ids = "---> DATA FROM LAST STEP HERE <---";
const my_id = "---> YOUR ID HERE <---";

function S(e,r){let t=0,s=0,a=0;for(let n of e)a++,t+=n.distance,s+=(new Date(n.created)-new Date(r[n.roundNumber-1].startTime))/1e3;return 0===a?["",""]:[t/a,s/a]}(await(async function D(e,r){d=[];let t=1;for(let s of r.slice(0,2000)){console.log("Fetching duel #"+t++);let l=await fetch("https://game-server.geoguessr.com/api/duels/"+s);l=await l.json();let o=[];for(let i of(o[0]=l.gameId,o[1]=l.currentRoundNumber,o[2]=new Date(l.rounds[0].startTime).toLocaleString("en-US"),o[3]=new Date(l.rounds[o[1]-1].endTime).toLocaleString("en-US"),l.teams))if(i.players[0].playerId===e){if(o[4]=i.health,null===i.players[0].progressChange)o[5]=i.players[0].rating,o[6]=o[5];else{let $=i.players[0].progressChange.competitiveProgress;null===$?(o[5]=i.players[0].rating,o[6]=o[5]):(o[5]=$.ratingBefore,o[6]=$.ratingAfter)}[o[7],o[8]]=S(i.players[0].guesses,l.rounds)}else o[9]=i.players[0].playerId,o[10]=i.health,o[11]=i.players[0].rating,[o[12],o[13]]=S(i.players[0].guesses,l.rounds);d.push(o),await (new Promise(e=>{setTimeout(()=>e(),100)}))}return d})(my_id,ids)).map(v => v.join("\t")).join("\n");