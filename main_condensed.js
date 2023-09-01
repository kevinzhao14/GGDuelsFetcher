/**
 * SCRIPT 1: paste in console at https://www.geoguessr.com/
 */

await(async(d,s,j)=>{let e="",t=[];for(let a=0;a<s&&!t.includes(j);a++){console.log("Fetching page",a+1);let l="https://www.geoguessr.com/api/v4/feed/private";""!==e&&(l+="?paginationToken="+e);let n=await fetch(l),g=JSON.parse(n=await n.text());if(0===g.entries.length){console.log("All data fetched.");break}t.push(...[...n.matchAll(/\\"gameId\\":\\"([\w\d\-]*)\\",\\"gameMode\\":\\"Duels\\"/g)].map(e=>e[1])),e=btoa(`{"HashKey":{"S":"${d+"_activity"}"},"Created":{"S":"${g.entries[g.entries.length-1].time.substring(0,23)+"Z"}"}}`),await new Promise(e=>{setTimeout(()=>{e()},500)})}t=t.filter((v,i,a)=>a.indexOf(v)===i);return t.includes(j)?t.slice(0,t.indexOf(j)):t})("--->YOUR ID HERE<---",100);




/**
 * SCRIPT 2: paste in console at https://game-server.geoguessr.com/
 */

const ids = "---> DATA FROM LAST STEP HERE <---";
const my_id = "---> YOUR ID HERE <---";

if (results[rn].healthAfter === results[rn].healthBefore) {
  // rounds won
  countries[country][3]++;
} 

function S(e,r,l,p){let t=0,s=0,a=0,c={};for(let n of e){let u=n.roundNumber-1,m=(new Date(n.created)-new Date(r[u].startTime))/1e3,o=r[u].panorama?.countryCode;a++,t+=n.distance,s+=m;if(o===""||!l)continue;if(!(o in c))c[o]=[0,0,0,0,0];c[o][0]++,c[o][1]+=n.distance,c[o][2]+=m;if(l[u].healthAfter>=l[u].healthBefore)c[o][3]++;else c[o][4]+=p[u].score-l[u].score}return 0===a?["","",""]:[t/a,s/a,Object.entries(c).map(e=>e[0]+","+e[1].join(",")).join(";")]}(await(async function D(e,r){console.log("Running v1.3");d=[];let t=1;for(let s of r.slice(0,2000)){console.log("Fetching duel #"+t++,s);let l=await fetch("https://game-server.geoguessr.com/api/duels/"+s);l=await l.json();let o=[];for(let c in [0,1]){let i=l.teams[c];o[0]=l.gameId,o[1]=l.currentRoundNumber,o[2]=new Date(l.rounds[0].startTime).toLocaleString("en-US"),o[3]=new Date(l.rounds[o[1]-1].endTime).toLocaleString("en-US");if(i.players[0].playerId===e){if(o[4]=i.health,null===i.players[0].progressChange)o[5]=i.players[0].rating,o[6]=o[5];else{let $=i.players[0].progressChange.competitiveProgress;null===$?(o[5]=i.players[0].rating,o[6]=o[5]):(o[5]=$.ratingBefore,o[6]=$.ratingAfter)}[o[7],o[8],o[14]]=S(i.players[0].guesses,l.rounds,i.roundResults,l.teams[1-c].roundResults)}else o[9]=i.players[0].playerId,o[10]=i.health,o[11]=i.players[0].rating,[o[12],o[13]]=S(i.players[0].guesses,l.rounds)}d.push(o),await (new Promise(e=>{setTimeout(()=>e(),100)}))}return d})(my_id,ids)).map(v => v.join("\t")).join("\n");