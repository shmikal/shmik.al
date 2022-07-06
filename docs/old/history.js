"use strict";
const queues = {
	"0": "Custom",
	"70": "SR One for All",
	"72": "HA 1v1 Snowdown Showdown",
	"73": "HA 2v2 Snowdown Showdown",
	"75": "SR 6v6 Hexakill",
	"76": "SR URF",
	"78": "HA One For All: Mirror",
	"83": "SR Co-op vs AI URF",
	"98": "TT 6v6 Hexakill",
	"100": "BB 5v5 ARAM",
	"310": "SR Nemesis",
	"313": "SR Black Market Brawlers",
	"317": "CS Definitely Not Dominion",
	"325": "SR All Random",
	"400": "SR Draft",
	"420": "SR Ranked Solo",//ranked
	"430": "SR Blind",
	"440": "SR Ranked Flex",//ranked
	"450": "HA ARAM",
	"460": "TT Blind",
	"470": "TT Ranked Flex",//ranked
	"600": "SR Blood Hunt",
	"610": "CR Dark Star: Singularity",
	"700": "SR Clash",
	"800": "TT Co-op vs AI Intermediate",
	"810": "TT Co-op vs AI Intro",
	"820": "TT Co-op vs AI Beginner",
	"830": "SR Co-op vs AI Intro",
	"840": "SR Co-op vs AI Beginner",
	"850": "SR Co-op vs AI Intermediate",
	"900": "SR ARURF",
	"910": "CS Ascension",
	"920": "HA Legend of the Poro King",
	"940": "SR Nexus Siege",
	"950": "SR Doom Bots Voting",
	"960": "SR Doom Bots Standard",
	"980": "VP Star Guardian Invasion: Normal",
	"990": "VP Star Guardian Invasion: Onslaught",
	"1000": "OC Project: Hunters",
	"1010": "SR Snow ARURF",
	"1020": "SR One for All",
	"1030": "OE Intro",
	"1040": "OE Cadet",
	"1050": "OE Crewmember",
	"1060": "OE Captain",
	"1070": "OE Onslaught",
    "1200": "NB Nexus Blitz",
    "1300": "NB Nexus Blitz",
    "1400": "SR Ultimate Spellbook",
	"2000": "SR Tutorial 1",
	"2010": "SR Tutorial 2",
	"2020": "SR Tutorial 3"
};
let history = [];
let champion_data = {};
let spell_data = {};
loadJSON("data/champions.json", data => {
    champion_data = JSON.parse(data);
    loadJSON("data/summoner.json", data => {
        spell_data = JSON.parse(data);
        loadJSON("computed/history.json", data => {
            history = JSON.parse(data);
            loadHistory();
        });
    });
});


function loadHistory(all = false) {
    if (history.length == 0) return;
    let new_history_list = "";
    document.getElementById("match-history").innerHTML = generateFillerMatches();
    document.body.style.cursor = "wait";
    setTimeout(() => {
        const page = getPage() - 1;
        for (let i = page * entriesPerPage(); i < history.length && (all || i < (page + 1) * entriesPerPage()); ++i) {
            new_history_list += createMatchHistoryElement(history[i]);
        }
        document.getElementById("match-history").innerHTML = new_history_list;
        document.body.style.cursor = "default";
        try {
            timeago.render(document.querySelectorAll(".date-render"));
        }
        catch (e) {}
        document.getElementById("result-count").innerText = `Showing matches #${(page * entriesPerPage()) + 1}-${(page + 1) * entriesPerPage()} of ${history.length}, Page ${page + 1} of ${Math.ceil(history.length / entriesPerPage())}`;
    }, 0);
}

function createMatchHistoryElement(md) {
    const target = getTargetFromMatchData(md);
    const ts = new Date(md.timestamp);
    let answer = `<div class="row single-match ${md.win ? "match-victory" : "match-defeat"}" onclick="openMH(${md.mid});">
    <div class="col-1 five-line-stack">${queues[md.qid]}<br><span style="font-weight: bold;">${md.win ? "Victory/Win" : "Defeat/Loss"}</span><br>${standardTimestamp(md.duration)}<br>${standardDate(ts)} ${standardTime(ts)}<br><span class="date-render" datetime="${md.timestamp}"></span></div>
    <div class="col-1 cv">${championStack(md, target)}</div>
    <div class="col-1 cv ch tac"><div>${md.K} / ${md.D} / ${md.A}<br>${KDAPreventInfinity(md).toFixed(2)} KDA<br>${multiKillDisplay(target)}</div></div>
    <div class="col-1 cv ch tac">Lv. ${target.lv}<br>${target.cs} (${(target.cs / (md.duration / 60)).toFixed(1)}) CS<br>${KPDisplay(md)}</div>
    <div class="col-1"><div class="tal flm cv">${itemStack(md, target)}</div></div>
    <div class="col-1-5 player-name-stack"><div class=" tar fr">${md.teams["-1"].map(p => (p.target ? `<span class="target">${p.ign}</span>` : p.ign) + " " + championIDtoImg(p.cid, "")).join("<br>")}</div></div>
    <div class="col-1 player-name-stack"><div class="tal flm">${md.teams["-1"].map(p => stackedCSDisplay(md, p)).join("<br>")}</div><div class="tar frm">${md.teams["-1"].map(p => `${p.K} / ${p.D} / ${p.A}`).join("<br>")}</div></div>
    <div class="col-1 player-name-stack"><div class="tal flm">${md.teams["1"].map(p => `${p.K} / ${p.D} / ${p.A}`).join("<br>")}</div><div class="tar frm">${md.teams["1"].map(p => stackedCSDisplay(md, p)).join("<br>")}</div></div>
    <div class="col-1-5 player-name-stack"><div class="tal fl">${md.teams["1"].map(p => championIDtoImg(p.cid, "") + " " + (p.target ? `<span class="target">${p.ign}</span>` : p.ign)).join("<br>")}</div></div>
    </div>`;
    return answer;
}

function generateFillerMatches() {
    let answer = "";
    for (let i = 0; i < 10; ++i) {
        answer += `<div class="row single-match ${Math.random() >= 0.5 ? "match-victory" : "match-defeat"}">
        <div class="col-1 five-line-stack">&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;</div>
        </div>`;
    }
    return answer.repeat(Math.ceil(entriesPerPage() / 10));
}

function openMH(mid) {
    //window.open(`https://matchhistory.na.leagueoflegends.com/en/#match-details/NA1/${mid}?tab=overview`, "_blank");
}

function championStack(md, target) {
    return `<div>${spellIDtoImg(target?.spells[0])}<br>${spellIDtoImg(target?.spells[1])}</div> ${championIDtoImg(md.cid, "champion-img-main")} ${getChampionNameFromId(md.cid)}`;
}
function itemStack(md, target) {
    return `<div>${itemArrayToImg(md, target?.items.slice(0,3))}<br>${itemArrayToImg(md, target?.items.slice(3,6))}</div><div class="cv">${itemIDtoImg(md.patch, target?.items[6])}</div>`;
}
function stackedCSDisplay(md, p) {
    //return `${p.cs} (${(p.cs / (md.duration / 60)).toFixed(1)})`;
    return p.cs;
}
function KPDisplay(md) {
    if (md.kp !== null) {
        return `${md.kp}% KP`;
    }
    return "";
}
function multiKillDisplay(p) {
    if (p.multi_kills["L"] > 0 || p.multi_kills["5"] > 0) {
        return "<span class=\"multi-kill\">Penta Kill</span>";
    }
    else if (p.multi_kills["4"] > 0) {
        return "<span class=\"multi-kill\">Quadra Kill</span>";
    }
    else if (p.multi_kills["3"] > 0) {
        return "<span class=\"multi-kill\">Triple Kill</span>";
    }
    else if (p.multi_kills["2"] > 0) {
        return "<span class=\"multi-kill\">Double Kill</span>";
    }
    return "";
}
function KDAPreventInfinity(match_data) {
    if (match_data.D == 0) {
        return match_data.K + match_data.A;
    }
    else return (match_data.K + match_data.A) / match_data.D;
}

function loadJSON(path, callback) {
    var xobj = new XMLHttpRequest();
    xobj.open('GET', path, true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);
}

function setEntriesPerPage(new_value) {
    document.getElementById("entries-per-page").value = new_value;
    loadHistory();
}

function entriesPerPage() {
    return parseInt(document.getElementById("entries-per-page").value);
}

function getPage() {
    return parseInt(document.getElementById("page-number").value);
}

function firstPage() {
    document.getElementById("page-number").value = 1;
    loadHistory();
}

function nextPage() {
    document.getElementById("page-number").value = getPage() + 1;
    loadHistory();
}

function previousPage() {
    const pn = getPage() - 1;
    if (pn < 1) return;
    else {
        document.getElementById("page-number").value = getPage() - 1;
        loadHistory();
    }
}

function lastPage() {
    document.getElementById("page-number").value = Math.ceil(history.length / entriesPerPage());
    loadHistory();
}

function getChampionNameFromId(key) {
    for (let name in champion_data.data) {
        //console.log(champion_data[name])
        if (champion_data.data[name].key == key) {
            return champion_data.data[name].name;
        }
    }
    return "Unknown";
}


function championIDtoImg(id, img_class = "champion-img") {
    for (let b in champion_data.data) {
        if (champion_data.data[b].key == id) {
            return `<img${img_class == "" ? "" : ` class=${img_class}`} src="https://ddragon.leagueoflegends.com/cdn/${champion_data.version}/img/champion/${b}.png">`;
        }
    }
    const lanes = [null, "data/top.png", "data/jng.png", "data/mid.png", "data/sup.png", "data/bot.png"];
    let prospective_index = -parseInt(id);
    if (prospective_index >= 1 && prospective_index <= 5) return `<img class="${img_class}" src="${lanes[prospective_index]}">`;
    return "";
}

function itemArrayToImg(md, items) {
    let answer = "";
    for (let i = 0; i < items.length; ++i) {
        if (items[i]) answer += itemIDtoImg(md.patch, items[i]);
    }
    return answer;
}

function itemIDtoImg(patch, id, img_class = "item-img") {
    if (id == 0) return ``;
    return `<img class="${img_class}" src="https://ddragon.leagueoflegends.com/cdn/${patch}.1/img/item/${id}.png">`;
}

function spellIDtoImg(id, img_class = "spell-img") {
    for (let b in spell_data.data) {
        if (spell_data.data[b].key == id) {
            return `<img class="${img_class}" src="https://ddragon.leagueoflegends.com/cdn/${spell_data.version}/img/spell/${spell_data.data[b].id}.png">`;
        }
    }
    return "";
}

function getTargetFromMatchData(match_data) {
    for (let team in match_data.teams) {
        for (let player in match_data.teams[team]) {
            if (match_data.teams[team][player].target) return match_data.teams[team][player];
        }
    }
    return null;
}

function standardTimestamp(sec) {
	let mins = Math.floor(parseInt(sec) / 60);
	let hours = Math.floor(parseInt(mins) / 60);
	let days = Math.floor(parseInt(hours) / 24);
	mins = mins % 60;
	hours = hours % 24;
	let secs = Math.floor(parseInt(sec) % 60);
	if (secs < 10) secs = "0" + secs;
	if (mins < 10) mins = "0" + mins;
	if (hours < 10) hours = "0" + hours;
	if (hours == "00" && days == 0) return `${mins}m:${secs}s`;
	else if (days == 0) return `${hours}h:${mins}m:${secs}s`;
	else return `${days}d:${hours}h:${mins}m:${secs}s`;
}

function standardDate(date) {
    return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")}`;
}

function standardTime(date) {
    return `${date.getUTCHours().toString().padStart(2, "0")}:${date.getUTCMinutes().toString().padStart(2, "0")}`;
}