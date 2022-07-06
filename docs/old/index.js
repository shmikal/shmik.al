"use strict";
let MMR_TIER_DIV = {
    "0": "--",
    "100": "I4",
    "200": "I3",
    "300": "I2",
    "400": "I1",
    "500": "B4",
    "600": "B3",
    "700": "B2",
    "800": "B1",
    "900": "S4",
    "1000": "S3",
    "1100": "S2",
    "1200": "S1",
    "1300": "G4",
    "1400": "G3",
    "1500": "G2",
    "1600": "G1",
    "1700": "P4",
    "1800": "P3",
    "1900": "P2",
    "2000": "P1",
    "2100": "D4",
    "2200": "D3",
    "2300": "D2",
    "2400": "D1",
    "2500": "MA",
    "2600": "GM",
    "2700": "CH",
};
const BLUE_SPAN = `<span style="color:#89bbf9;background-color:inherit;">`;
let table_cache = {};
let table_sort_settings = {};
let match_performance = [];
generateFriendTable();
generateChampionTable();
generateKryptonite();
const opt1 = {
    radius: 7,
    opacity: undefined,
    minOpacity: .1,
    maxOpacity: .7,
    blur: 0.5
};
const opt2 = {
    min: 0,
    max: 5
};
const lds_max = 9;//large data set max (heatmap)
function generateKryptonite() {
    loadHTML("d40");
    loadHTML("d41");
    loadHTML("d42");
    loadHTML("d43");
    loadHTML("d45");
}

function generateChampionTable() {
    loadHTML("d2");
    loadHTML("d2a");
    loadHTML("d3");
    loadHTML("d4");
    loadHTML("d5");
    loadHTML("d6");
    loadHTML("d7");
    loadHTML("d8");
    loadHTML("d9");
    loadHTML("d0a", () => {
        timeago.render(document.querySelectorAll(".date-render"));
    });
    loadJSON("data/champions.json", champion_data => {
        champion_data = JSON.parse(champion_data);
        function appendChampionNameTo(div_id, champion_key, champion_name) {
            let opt = document.createElement("option");
            opt.value = champion_key;
            opt.innerHTML = champion_name;
            $(div_id).appendChild(opt);
        }
        loadJSON("compiled/d1f.html", matches => {
            matches = JSON.parse(matches);
            match_performance = matches;
            displayChampionPatchNew(84, "d1fcustom", "Akali", [["914", "815"], ["1023", "1016", "1012", "1007", "919", "905"], ["1102", "1025", "1019", "1003", "924", "918", "911", "909", "903", "822", "818"], ["1101", "1022", "907", "824", "823", "817"]]);
            for (let b in champion_data.data) {
                if (matches[champion_data.data[b].key + ""] !== undefined) {
                    appendChampionNameTo("d1f-champion-name", champion_data.data[b].key, champion_data.data[b].name);
                }
            }
        });
        loadHTML("d5a", () => {
            for (let b in champion_data.data) {
                if (table_cache.d5a[champion_data.data[b].key + ""] !== undefined) {
                    appendChampionNameTo("d5a-champion-name", champion_data.data[b].key, champion_data.data[b].name);
                }
            }
        });
        loadHTML("d5b", () => {
            for (let b in champion_data.data) {
                if (table_cache.d5b[champion_data.data[b].key + ""] !== undefined) {
                    appendChampionNameTo("d5b-champion-name", champion_data.data[b].key, champion_data.data[b].name);
                }
            }
        });

    });
    loadJSON("computed/enemy-ranks.json", ranks => {
        ranks = JSON.parse(ranks);
        const mmr_buckets = ranks.map(r => MMR_TIER_DIV[r.mmr]);
        Plotly.newPlot("d0e", [
                {   x: mmr_buckets,
                    y: ranks.map(r => r.w),
                    type: "bar",
                    histfunc: "count",
                    name: "wins",
                    marker: { color: "green", line: { width: 1 }}
                },
                {   x: mmr_buckets,
                    y: ranks.map(r => r.l),
                    type: "bar",
                    histfunc: "count",
                    name: "losses",
                    marker: { color: "red", line: { width: 1 }}
                },
                {
                    x: mmr_buckets,
                    y: ranks.map(r => (100 * r.w / (r.w + r.l)).toFixed(2)),
                    yaxis: "y2",
                    type: "scatter",
                    mode: "lines+markers",
                    name: "win rate %",
                    marker: { color: "#add8e6", line: { width: 1 }}}], {
            barmode: "group",
            title: "Winrate Against Different Ranks<br>(excludes AI games and remakes)",
            xaxis: {title: {text:"Enemy Laner's Rank (Tier + Division)"}},
            yaxis: {title: {text:"# of games"}},
            yaxis2: {title: {text:"% winrate"},
                overlaying: "y",
                side: "right",
                range: [0, 100],
                showgrid: true,
                tickvals: [40, 50, 60],
                ticktext: ["40%", "50%", "60%"],
                gridcolor: "#add8e6"
            },
            height: 600,
        }, {
            displayModeBar: false
        });
        Plotly.newPlot("d0f", [
            {   x: mmr_buckets,
                y: ranks.map(r => r.pw),
                type: "bar",
                histfunc: "count",
                name: "better",
                marker: { color: "green", line: { width: 1 }}
            },
            {   x: mmr_buckets,
                y: ranks.map(r => r.pe),
                type: "bar",
                histfunc: "count",
                name: "equal",
                marker: { color: "yellow", line: { width: 1 }}
            },
            {   x: mmr_buckets,
                y: ranks.map(r => r.pl),
                type: "bar",
                histfunc: "count",
                name: "worse",
                marker: { color: "red", line: { width: 1 }}
            },
            {
                x: mmr_buckets,
                y: ranks.map(r => (100 * (r.pw + (r.pe / 2)) / (r.pw + r.pl + r.pe)).toFixed(2)),
                yaxis: "y2",
                type: "scatter",
                mode: "lines+markers",
                name: "% games, better",
                marker: { color: "#add8e6", line: { width: 1 }}}
            ], {
                barmode: "group",
                title: "Performance Against Different Ranks<br>(excludes AI games and remakes)",
                xaxis: {title: {text:"Enemy Laner's Rank (Tier + Division)"}},
                yaxis: {title: {text:"# of games"}},
                yaxis2: {title: {text:"% games with better performance"},
                overlaying: "y",
                side: "right",
                range: [0, 100],
                showgrid: true,
                tickvals: [40, 50, 60],
                ticktext: ["40%", "50%", "60%"],
                gridcolor: "#add8e6"
            },
            height: 600,
        }, {
            displayModeBar: false
        });
    });
    loadJSON("compiled/d0b.html", matches => {
        matches = JSON.parse(matches);

        generatePlotd0b(matches.durations_w, matches.durations_l, matches.durations_ff, matches.duration_wr_x, matches.duration_wr_y, matches.ff15, matches.ff20);
    });
    if (false) loadJSON("compiled/match-performance.json", matches => {
        matches = JSON.parse(matches);
        match_performance = matches;
        let durations_w = [];
        let durations_l = [];
        let durations_ff = [];
        for (let b in matches) {
            if (matches[b].win) {
                durations_w.push(Math.floor(matches[b].duration / 60));
            }
            else {
                durations_l.push(Math.floor(matches[b].duration / 60));
            }
            if (matches[b].ff) {
                durations_ff.push(Math.floor(matches[b].duration / 60));
            }
        }
        let ff15_w = 0;
        let ff15_l = 0;
        for (let b in durations_w) if (durations_w[b] == 15) ++ff15_w;
        for (let b in durations_l) if (durations_l[b] == 15) ++ff15_l;
        let ff15 = Math.max(ff15_w, ff15_l);
        let ff20_w = 0;
        let ff20_l = 0;
        for (let b in durations_w) if (durations_w[b] == 20) ++ff20_w;
        for (let b in durations_l) if (durations_l[b] == 20) ++ff20_l;
        let ff20 = Math.max(ff20_w, ff20_l);
        let duration_wr = {};
        for (let b in durations_w) {
            if (duration_wr[durations_w[b]] == undefined) {
                duration_wr[durations_w[b]] = { w: 0, l: 0 };
            }
            duration_wr[durations_w[b]].w++;
        }
        for (let b in durations_l) {
            if (duration_wr[durations_l[b]] == undefined) {
                duration_wr[durations_l[b]] = { w: 0, l: 0 };
            }
            duration_wr[durations_l[b]].l++;
        }
        let duration_wr_x = [];
        let duration_wr_y = [];
        for (let b in duration_wr) {
            duration_wr_x.push(b);
            duration_wr_y.push((100 * (duration_wr[b].w / (duration_wr[b].w + duration_wr[b].l))).toFixed(2));
        }
        generatePlotd0b(durations_w, durations_l, durations_ff, duration_wr_x, duration_wr_y, ff15, ff20);

        displayChampionPatch(84, "d1fcustom", "Akali", [["914", "815"], ["1023", "1016", "1012", "1007", "919", "905"], ["1102", "1025", "1019", "1003", "924", "918", "911", "909", "903", "822", "818"], ["1101", "1022", "907", "824", "823", "817"]]);
    });

    function generatePlotd0b(durations_w, durations_l, durations_ff, duration_wr_x, duration_wr_y, ff15, ff20) {
        Plotly.newPlot("d0b", [{x: durations_w, type: "histogram", name: "wins", marker: { color: "green", line: { width: 1 }}},
                {x: durations_l, type: "histogram", name: "losses", marker: { color: "red", line: { width: 1 }}},
                {x: durations_ff, type: "histogram", name: "forfeits", marker: { color: "black", line: { width: 1 }}},
                {x: duration_wr_x, y: duration_wr_y, yaxis: "y2", type: "scatter", mode: "lines+markers", name: "win rate %", marker: { color: "#add8e6", line: { width: 1 }}}], {
            barmode: "group",
            title: "Match Length<br>(excludes AI games and remakes)",
            xaxis: {title: {text:"minutes"}},
            yaxis: {title: {text:"# of games"}},
            yaxis2: {title: {text:"% winrate"},
                overlaying: "y",
                side: "right",
                range: [0, 100],
                showgrid: true,
                tickvals: [40, 50, 60],
                ticktext: ["40%", "50%", "60%"],
                gridcolor: "#add8e6"
            },
            height: 500,
            annotations: [
                {
                    x: 15,
                    y: ff15,
                    xref: 'x',
                    yref: 'y',
                    text: 'haha',
                    showarrow: true,
                    arrowhead: 2,
                    arrowsize: 1,
                    arrowwidth: 2,
                    ax: 35,
                    ay: -30,
                    font: {
                        color: "#000000"
                    }
                },
                {
                    x: 20,
                    y: ff20,
                    xref: 'x',
                    yref: 'y',
                    text: 'also haha',
                    showarrow: true,
                    arrowhead: 2,
                    arrowsize: 1,
                    arrowwidth: 2,
                    ax: 35,
                    ay: -30,
                    font: {
                        color: "#000000"
                    }
                }
            ]
        }, {
            displayModeBar: false
        });
    }

    loadJSON("computed/kd-time.json", data => {
        data = JSON.parse(data);
        const maxKDA = Math.max(...data.kda.y);
        let y2ticks = [1, 2, 3, 4];
        for (let i = 5; i < maxKDA; i += 5) {
            y2ticks.push(i);
        }
        Plotly.newPlot("d0c", [{x: data.kills.x, y: data.kills.y, type: "histogram", histfunc: "sum", name: "kills", marker: { color: "green", line: { width: 1 }}, xbins: { size: 1, start: 0 }},
        {x: data.deaths.x, y: data.deaths.y, type: "histogram", histfunc: "sum", name: "deaths", marker: { color: "red", line: { width: 1 }}, xbins: { size: 1, start: 0 }},
        {x: data.assists.x, y: data.assists.y, type: "histogram", histfunc: "sum", name: "assists", marker: { color: "#add8e6", line: { width: 1 }}, xbins: { size: 1, start: 0 }},
        {x: data.kda.x, y: data.kda.y, yaxis: "y2", type: "scatter", mode: "lines+markers", name: "KDA Ratio", marker: { color: "gold", line: { width: 1 }}}], {
            barmode: "group",
            height: 500,
            title: "K/D/A by minute<br>(excludes AI games and remakes)",
            xaxis: {
                title: {text:"minutes"},
                rangemode: 'tozero',
                autorange: true
            },
            yaxis: {title: {text:"# of kills, deaths, or assists"},
                gridcolor: "#999999",
                showgrid: false
            },
            yaxis2: {
                title: {text:"KDA Ratio"},
                rangemode: 'tozero',
                autorange: true,
                overlaying: "y",
                side: "right",
                showgrid: true,
                tickvals: y2ticks,
                ticktext: y2ticks,
                gridcolor: "gold" }
        }, {
            displayModeBar: false
        });
    });

    loadJSON("computed/dates.json", data => {
        data = JSON.parse(data);
        data.type = "heatmap";
        data.colorscale = "Portland";
        data.hovertemplate = "Week of %{x}, %{y}<br>%{z} games played<extra></extra>";
        Plotly.newPlot("d1b", [data], {
            title: "Games per day (UTC timezone)"
        }, {
            displayModeBar: false
        });
    });

    loadJSON("computed/special-dates.json", data => {
        data = JSON.parse(data);
        data.type = "heatmap";
        data.colorscale = "Portland";
        data.hovertemplate = "Week of %{x}, %{y}<br>%{z} games played<extra></extra>";
        Plotly.newPlot("d1b1", [data], {
            title: "Non-Regular SR Games per day (UTC timezone)"
        }, {
            displayModeBar: false
        });
    });

    loadJSON("computed/ranked-dates.json", data => {
        data = JSON.parse(data);
        data.type = "heatmap";
        data.colorscale = "Portland";
        data.hovertemplate = "Week of %{x}, %{y}<br>%{z} games played<extra></extra>";
        Plotly.newPlot("d1c", [data], {
            title: "Ranked games per day (UTC timezone)<br>(excludes remakes)"
        }, {
            displayModeBar: false
        });
    });

    loadJSON("computed/gold.json", data => {
        data = JSON.parse(data);
        data.type = "heatmap";
        data.hovertemplate = "at minute %{x} with a team gold difference of %{y:+}k<br>%{z:.2f}% winrate<extra></extra>";
        data.colorscale = [
            ['0', 'rgb(255,0,0)'],
            ['0.15', 'rgb(255,127,0)'],
            ['0.50', 'rgb(255,255,255)'],
            ['0.85', 'rgb(127,255,0)'],
            ['1', 'rgb(0,255,0)']
        ];
        data.colorbar = {
            title: "winrate %"
        };
        Plotly.newPlot("d0d", [data], {
            title: "Winrate by Gold Advantage and Minute<br>(excludes AI games and remakes)",
            height: 900,
            xaxis: {
                gridcolor: '#bdbdbd',
                gridwidth: 1,
                showgrid: true,
                title: "minute"
            },
            yaxis: {
                gridcolor: '#bdbdbd',
                gridwidth: 1,
                title: "team gold diff (thousands)",
                showgrid: true
            },
            plot_bgcolor: "#17181d"
        }, {
            displayModeBar: false
        });
    });

    loadJSON("computed/times.json", data => {
        data = JSON.parse(data);
        const tzoffset_hours = -Math.round(new Date().getTimezoneOffset() / 60);
        if (data.z[0].length == 24) {
            data.tzoffset = tzoffset_hours < 0 ? tzoffset_hours + "" : `+${tzoffset_hours}`;
            data = tzShift(data, tzoffset_hours);
            let all_days = zeroArray(24);//get w/l for each hour
            for (let i = 0; i < data.z.length; ++i) {
                for (let j = 0; j < data.z[i].length; ++j) {
                    all_days[j] += data.z[i][j] / 7;
                }
            }


            let all_hours = zeroArray(7);//get w/l for each day
            for (let i = 0; i < data.z.length; ++i) {
                for (let j = 0; j < data.z[i].length; ++j) {
                    all_hours[i] += data.z[i][j] / 24;
                }
            }

            data.z.unshift(all_days);
            for (let i = 0; i < all_hours.length; ++i) {
                data.z[i + 1].push(all_hours[i]);
            }
            data.z[0].push(data.games / (24 * 7));
        }
        data.type = "heatmap";
        data.hovertemplate = `%{y} %{x} UTC${data.tzoffset}<br>%{z} games played<extra></extra>`;
        data.colorscale = "Portland";
        data.colorbar = {
            title: "# of games"
        };
        Plotly.newPlot("d1d", [data], {
            title: "Hourly schedule<br>(excludes remakes)",
            height: 450,
            xaxis: {
                gridcolor: '#bdbdbd',
                gridwidth: 2,
                dtick: 1,
                showgrid: true,
                title: `Hour of Day, UTC${data.tzoffset}`,
                type: "category"
            },
            yaxis: {
                gridcolor: '#bdbdbd',
                gridwidth: 2,
                showgrid: true
            }
        }, {
            displayModeBar: false
        });
    });

    loadJSON("computed/wr-times.json", data => {
        data = JSON.parse(data);
        const tzoffset_hours = -Math.round(new Date().getTimezoneOffset() / 60);
        if (data.z[0].length == 24) {
            data.tzoffset = tzoffset_hours < 0 ? tzoffset_hours + "" : `+${tzoffset_hours}`;
            data = tzShift(data, tzoffset_hours);
            let all_days = emptyObjectArray(24);//get w/l for each hour
            for (let i = 0; i < data.z.length; ++i) {
                for (let j = 0; j < data.z[i].length; ++j) {
                    all_days[j].w += data.z[i][j].w;
                    all_days[j].l += data.z[i][j].l;
                }
            }

            let all_hours = emptyObjectArray(7);//get w/l for each day
            for (let i = 0; i < data.z.length; ++i) {
                for (let j = 0; j < data.z[i].length; ++j) {
                    all_hours[i].w += data.z[i][j].w;
                    all_hours[i].l += data.z[i][j].l;
                }
            }

            data.z.unshift(all_days);
            for (let i = 0; i < all_hours.length; ++i) {
                data.z[i + 1].push(all_hours[i]);
            }
            data.z[0].push({ w: data.wins, l: data.losses });

            //transforms to wr%
            for (let b in data.z) {
                data.z[b] = data.z[b].map(v => (100 * (v.w / (v.l + v.w))).toFixed(2));
            }
        }
        data.type = "heatmap";
        data.hovertemplate = `%{y} %{x} UTC${data.tzoffset}<br>%{z}% winrate<extra></extra>`;
        data.colorscale = [
            ['0', 'rgb(255,0,0)'],
            ['0.25', 'rgb(255,0,0)'],
            ['0.45', 'rgb(255,127,0)'],
            ['0.50', 'rgb(255,255,255)'],
            ['0.55', 'rgb(127,255,0)'],
            ['0.75', 'rgb(0,255,0)'],
            ['1', 'rgb(0,255,0)']
        ];
        data.colorbar = {
            title: "winrate %"
        };
        Plotly.newPlot("d1e", [data], {
            title: "Winrate by hour<br>(excludes AI games and remakes)",
            height: 450,
            xaxis: {
                gridcolor: '#bdbdbd',
                gridwidth: 2,
                dtick: 1,
                showgrid: false,
                title: `Hour of Day, UTC${data.tzoffset}`,
                type: "category"
            },
            yaxis: {
                gridcolor: '#bdbdbd',
                gridwidth: 2,
                showgrid: false
            },
            plot_bgcolor: "#17181d"
        }, {
            displayModeBar: false
        });
    });
}
function generateFriendTable() {
    loadHTML("d0", () => {
        timeago.render(document.querySelectorAll(".date-render"));
    });
    loadHTML("d1");
    loadHTML("d1a");
    loadHTML("d1a1");
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

function loadHTML(div, callback) {
    loadJSON(`compiled/${div}.html`, data => {
        if (data[0] === "{") {//new table format
            data = JSON.parse(data);
            if (table_cache[div] == undefined) {
                table_cache[div] = data;
            }
            if (data.multi) {
                if (table_sort_settings[div] == undefined) {
                    table_sort_settings[div] = {
                        i: -1,//index
                        r: false, //reverse
                        k: null
                    };
                }
            }
            else {
                if (table_sort_settings[div] == undefined) {
                    table_sort_settings[div] = {
                        i: -1,//index
                        r: false //reverse
                    };
                }
                resortTable(div, data.header.dsci, data.dsci_reverse);
            }
        }
        else {//old
            $(div).innerHTML = data;
        }
        if (callback) {
            try {
                callback();
            }
            catch(e) {
                console.error(e);
            }
        }
    });
}


function $(id) {
    return document.getElementById(id);
}

function tzShift(dataset, tzoffset_hours) {
    //does not account for the hourly or daily averages
    console.log(`tz offset is ${tzoffset_hours}h`);
    if (tzoffset_hours > 0) {
        let carry = dataset.z[dataset.z.length - 1][dataset.z[dataset.z.length - 1].length - 1];
        for (let i = 0; i < tzoffset_hours; ++i) {
            for (let dayofweek = 0; dayofweek < dataset.z.length; ++dayofweek) {
                dataset.z[dayofweek].unshift(carry);
                carry = dataset.z[dayofweek].pop();
            }
        }
    }
    else if (tzoffset_hours < 0) {
        let carry = dataset.z[0][0];
        for (let i = 0; i < Math.abs(tzoffset_hours); ++i) {
            for (let dayofweek = dataset.z.length - 1; dayofweek >= 0; --dayofweek) {
                dataset.z[dayofweek].push(carry);
                carry = dataset.z[dayofweek].shift();
            }
        }
    }
    return dataset;
}

function zeroArray(length) {
    let ans = [];
    for (let i = 0; i < length; ++i) ans.push(0);
    return ans;
}

function emptyObjectArray(length) {
    let ans = [];
    for (let i = 0; i < length; ++i) ans.push({
        w: 0,
        l: 0
    });
    return ans;
}

function resortTable(div, ci, reverse = false, DEBUG = false) {//ci = column index
    //if (div == "d2") DEBUG = true;
    let table_object = table_cache[div];
    if (table_sort_settings[div].k !== undefined) {//is a multi-table
        table_object = table_cache[div][table_sort_settings[div].k];
    }
    if (table_sort_settings[div].i == ci) {
        reverse = !table_sort_settings[div].r;
        table_sort_settings[div].r = reverse;
    }
    else {
        table_sort_settings[div].i = ci;
    }

    let ans = table_object.header.style;
    internal_debug(1);
    ans += "<tr>";
    internal_debug(2);
    for (let i = 0; i < table_object.header.th.length; ++i) {
        let title = "";
        if (table_object.header.tooltips) title = table_object.header.tooltips[i];
        if (i == ci) {
            let color = "#89bbf9";
            if (reverse) color = "#ff968f";
            ans += `<th title="${title}" onclick="resortTable('${div}', ${i});"><span style="color:${color};background-color:inherit;">${table_object.header.th[i]}</span></th>`;
        }
        else {
            ans += `<th title="${title}" onclick="resortTable('${div}', ${i});">${table_object.header.th[i]}</th>`;
        }
        internal_debug(3);
    }
    ans += "</tr>";
    internal_debug(4);
    if (table_object.headersupplement) {
        ans += `<tr><th>${table_object.headersupplement.th.join("</th><th>")}</th></tr>`;
        internal_debug(5);
    }
    if (reverse) {
        for (let i = table_object.sorts[ci].length - 1; i >= 0; --i) {
            ans += table_object.rows[table_object.sorts[ci][i]];
            internal_debug(`5:${i}:${ci}:${table_object.sorts[ci][i]}`);
        }
    }
    else {
        for (let i = 0; i < table_object.sorts[ci].length; ++i) {
            ans += table_object.rows[table_object.sorts[ci][i]];
            internal_debug(`5:${i}:${ci}:${table_object.sorts[ci][i]}`);
        }
    }
    internal_debug(6);
    ans += "</table>";
    internal_debug(7);
    $(div).innerHTML = ans;
    internal_debug(8);
    function internal_debug(place) {
        if (DEBUG) {
            console.log(ans);
            if (ans.indexOf("undefined") !== -1) {
                console.error(`undefined encountered when constructing table at place ${place}`);
                throw new Error();
            }
        }
    }
}

$("d1f-champion-name").addEventListener("change", () => {
    displayChampionPatchNew($("d1f-champion-name").value, "d1f", $("d1f-champion-name").options[$("d1f-champion-name").selectedIndex].text);
});
$("d5a-champion-name").addEventListener("change", () => {
    table_sort_settings.d5a.i = -1;
    table_sort_settings.d5a.k = $("d5a-champion-name").value;
    if (table_cache.d5a[table_sort_settings.d5a.k] === undefined) {
        $("d5a").innerHTML = "No Data";
    }
    else {
        resortTable("d5a", table_cache.d5a[table_sort_settings.d5a.k].header.dsci, table_cache.d5a[table_sort_settings.d5a.k].dsci_reverse);
    }
});
$("d5b-champion-name").addEventListener("change", () => {
    table_sort_settings.d5b.i = -1;
    table_sort_settings.d5b.k = $("d5b-champion-name").value;
    if (table_cache.d5b[table_sort_settings.d5b.k] === undefined) {
        $("d5b").innerHTML = "No Data";
    }
    else {
        resortTable("d5b", table_cache.d5b[table_sort_settings.d5b.k].header.dsci, table_cache.d5b[table_sort_settings.d5b.k].dsci_reverse);
    }
});
function displayChampionPatch(CHAMPION_FILTER, div, champion_name, annotations = [[], [], [], []]) {
    let patch_record = [];
    let matches = match_performance;
    for (let b in matches) {
        if (patch_record.findIndex(e => e.patch == matches[b].patch) == -1) {
            patch_record.push({ tg: 0, w: 0, l: 0, patch: matches[b].patch });
        }
        const patch_record_index = patch_record.findIndex(e => e.patch == matches[b].patch);
        if (matches[b].win) {
            if (matches[b].cid == CHAMPION_FILTER) patch_record[patch_record_index].w++;
        }
        else {
            if (matches[b].cid == CHAMPION_FILTER) patch_record[patch_record_index].l++;
        }
        patch_record[patch_record_index].tg++;
    }

    patch_record.sort((a, b) => a.patch - b.patch);
    const patch_ver = patch_record.map(e => e.patch + "");
    Plotly.newPlot(div, [{x: patch_ver, y: patch_record.map(e => e.w), type: "bar", name: "wins", marker: { color: "green", line: { width: 1 }}, visible: "legendonly"},
            {x: patch_ver, y: patch_record.map(e => e.l), type: "bar", name: "losses", marker: { color: "red", line: { width: 1 }}, visible: "legendonly"},
            {x: patch_ver, y: patch_record.map(e => 100 * (e.w / (e.w + e.l))), yaxis: "y2", type: "scatter", mode: "lines+markers", name: "win rate %", marker: { color: "#add8e6", line: { width: 1 }}},
            {x: patch_ver, y: patch_record.map(e => 100 * ((e.w + e.l) / e.tg)), yaxis: "y2", type: "scatter", mode: "lines+markers", name: "pick rate %", marker: { color: "pink", line: { width: 1 }}},
            {x: patch_ver, y: patch_record.map(e => happinessWithGameCount(e)), yaxis: "y2", type: "scatter", mode: "lines+markers", name: "happiness", marker: { color: "gold", line: { width: 1 }}}], {
        barmode: "group",
        title: champion_name + " Winrate by Patch<br>(excludes AI games and remakes)",
        xaxis: {title: {text:"patch"}, type: "category"},
        yaxis: {title: {text:"# of games"},
            rangemode: "nonnegative",
            autorange: true
        },
        yaxis2: {title: {text:"% win/pick rate"},
            overlaying: "y",
            side: "right",
            range: [0, 100],
            showgrid: true,
            tickvals: [40, 50, 60],
            ticktext: ["40%", "50%", "60%"],
            gridcolor: "#add8e6"
        },
        height: 500,
        annotations: createAnnotations(annotations[0], annotations[1], annotations[2], annotations[3])
    }, {
        displayModeBar: false
    });
    function happinessWithGameCount(e) {
        const games = e.w + e.l;
        const ans = ((Math.log10(100 * (games / e.tg)) + Math.log10(100 * (e.w / games))) * 20) + (Math.log2(games + 1) / Math.log2(1.75));
        if (ans < 0) return 0;
        else if (isNaN(ans)) return 0;
        else return ans;
    }
}
function displayChampionPatchNew(CHAMPION_FILTER, div, champion_name, annotations = [[], [], [], []]) {
    let matches = match_performance;
    let patch_record = matches[CHAMPION_FILTER + ""];
    if (patch_record === undefined) {
        $(div).innerHTML = "No Data";
        return;
    }
    $(div).innerHTML = "";

    const patch_ver = matches.patch_ver;
    Plotly.newPlot(div, [{x: patch_ver, y: patch_record.map(e => e[0]), type: "bar", name: "wins", marker: { color: "green", line: { width: 1 }}, visible: "legendonly"},
            {x: patch_ver, y: patch_record.map(e => e[1]), type: "bar", name: "losses", marker: { color: "red", line: { width: 1 }}, visible: "legendonly"},
            {x: patch_ver, y: patch_record.map(e => 100 * (e[0] / (e[0] + e[1]))), yaxis: "y2", type: "scatter", mode: "lines+markers", name: "win rate %", marker: { color: "#add8e6", line: { width: 1 }}},
            {x: patch_ver, y: patch_record.map((e, i) => 100 * ((e[0] + e[1]) / matches.tg[i].tg)), yaxis: "y2", type: "scatter", mode: "lines+markers", name: "pick rate %", marker: { color: "pink", line: { width: 1 }}},
            {x: patch_ver, y: patch_record.map((e, i) => happinessWithGameCount(e, i)), yaxis: "y2", type: "scatter", mode: "lines+markers", name: "happiness", marker: { color: "gold", line: { width: 1 }}}], {
        barmode: "group",
        title: champion_name + " Winrate by Patch<br>(excludes AI games and remakes)",
        xaxis: {title: {text:"patch"}, type: "category"},
        yaxis: {title: {text:"# of games"},
            rangemode: "nonnegative",
            autorange: true
        },
        yaxis2: {title: {text:"% win/pick rate"},
            overlaying: "y",
            side: "right",
            range: [0, 100],
            showgrid: true,
            tickvals: [40, 50, 60],
            ticktext: ["40%", "50%", "60%"],
            gridcolor: "#add8e6"
        },
        height: 500,
        annotations: createAnnotations(annotations[0], annotations[1], annotations[2], annotations[3])
    }, {
        displayModeBar: false
    });
    function happinessWithGameCount(e, i) {
        const games = e[0] + e[1];
        const ans = ((Math.log10(100 * (games / matches.tg[i].tg)) + Math.log10(100 * (e[0] / games))) * 20) + (Math.log2(games + 1) / Math.log2(1.75));
        if (ans < 0) return 0;
        else if (isNaN(ans)) return 0;
        else return ans;
    }
}
function createAnnotations(rework, buff, nerf, bugfix) {
    let ans = [];
    const CEIL = 0;
    const SHIFT = -42;
    for (let b in rework) {
        ans.push({
            visible: true,
            x: rework[b], y: CEIL,
            xref: 'x', yref: 'y',
            text: '<b>#</b>',
            showarrow: true, arrowhead: 2, arrowsize: 1, arrowwidth: 2, arrowcolor: "magenta",
            xshift: -1, yshift: SHIFT,
            ax: 0, ay: 18,
            hovertext: "Rework",
            font: {
                color: "magenta"
            }
        });
        ans.push({
            visible: true,
            x: rework[b], y: 100,
            xref: 'x', yref: 'y2',
            text: '<b>#</b>',
            showarrow: true, arrowhead: 2, arrowsize: 1, arrowwidth: 2, arrowcolor: "magenta",
            xshift: -1, yshift: 0,
            ax: 0, ay: -18,
            hovertext: "Rework",
            font: {
                color: "magenta"
            }
        });
    }
    for (let b in nerf) {
        ans.push({
            visible: true,
            x: nerf[b], y: CEIL,
            xref: 'x', yref: 'y',
            text: '<b>-</b>',
            showarrow: true, arrowhead: 2, arrowsize: 1, arrowwidth: 2, arrowcolor: "red",
            xshift: -1, yshift: SHIFT,
            ax: 0, ay: 18,
            hovertext: "Nerf",
            font: {
                color: "red"
            }
        });
        ans.push({
            visible: true,
            x: nerf[b], y: 100,
            xref: 'x', yref: 'y2',
            text: '<b>-</b>',
            showarrow: true, arrowhead: 2, arrowsize: 1, arrowwidth: 2, arrowcolor: "red",
            xshift: -1, yshift: 0,
            ax: 0, ay: -18,
            hovertext: "Nerf",
            font: {
                color: "red"
            }
        });
    }
    for (let b in buff) {
        ans.push({
            visible: true,
            x: buff[b], y: CEIL,
            xref: 'x', yref: 'y',
            text: '<b>+</b>',
            showarrow: true, arrowhead: 2,
            arrowsize: 1, arrowwidth: 2, arrowcolor: "green",
            xshift: -1, yshift: SHIFT,
            ax: 0, ay: 18,
            hovertext: "Buff",
            font: {
                color: "green"
            }
        });
        ans.push({
            visible: true,
            x: buff[b], y: 100,
            xref: 'x', yref: 'y2',
            text: '<b>+</b>',
            showarrow: true, arrowhead: 2,
            arrowsize: 1, arrowwidth: 2, arrowcolor: "green",
            xshift: -1, yshift: 0,
            ax: 0, ay: -18,
            hovertext: "Buff",
            font: {
                color: "green"
            }
        });
    }
    for (let b in bugfix) {
        ans.push({
            visible: true,
            x: bugfix[b], y: CEIL,
            xref: 'x', yref: 'y',
            text: '<b>=</b>',
            showarrow: true, arrowhead: 2, arrowsize: 1, arrowwidth: 2, arrowcolor: "gold",
            xshift: -1, yshift: SHIFT,
            ax: 0, ay: 18,
            hovertext: "Bugfix",
            font: {
                color: "gold"
            }
        });
        ans.push({
            visible: true,
            x: bugfix[b], y: 100,
            xref: 'x', yref: 'y2',
            text: '<b>=</b>',
            showarrow: true, arrowhead: 2, arrowsize: 1, arrowwidth: 2, arrowcolor: "gold",
            xshift: -1, yshift: 0,
            ax: 0, ay: -18,
            hovertext: "Bugfix",
            font: {
                color: "gold"
            }
        });
    }
    return ans;
}

function goToMatchHistory(region, platform, mid) {
    window.open(`https://lolprofile.net/match/${region.toLowerCase()}/${mid}#`, "_blank");
}
