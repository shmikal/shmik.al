"use strict";
generateHeatMaps();
const opt1 = {
    radius: 7,
    opacity: undefined,
    minOpacity: .1,
    maxOpacity: .65,
    blur: 0.5
};
const opt2 = {
    min: 0,
    max: undefined //default 6
};

function calculateLDS(length) {
    if (length < 5000) return 7;
    else if (length < 10000) return 9;
    else if (length < 18000) return 11;
    else if (length < 25000) return 13;
    else return 15;
}

function calculateSDS(length) {
    if (length < 3000) return 4;//1.5
    else if (length < 4500) return 5;//1.5
    else if (length < 6000) return 6;//3
    else if (length < 9000) return 7;//3
    else if (length < 12000) return 8;//6
    else if (length < 15000) return 10;
    else return 12;
}

function generateHeatMaps() {
    function largeHM(div, data, lds_max) {
        let heatmap = h337.create({
            container: $(div),
            radius: opt1.radius,
            opacity: opt1.opacity,
            minOpacity: opt1.minOpacity,
            maxOpacity: opt1.maxOpacity,
            blur: opt1.blur
        });

        heatmap.setData({
            min: opt2.min,
            max: lds_max,
            data
        });

        console.log(div + ": " + heatmap.getDataURL());
    }

    function standardHM(div, data, tmax) {
        let heatmap = h337.create({
            container: $(div),
            radius: opt1.radius,
            opacity: opt1.opacity,
            minOpacity: opt1.minOpacity,
            maxOpacity: opt1.maxOpacity,
            blur: opt1.blur
        });

        heatmap.setData({
            min: opt2.min,
            max: tmax,
            data
        });

        console.log(div + ": " + heatmap.getDataURL());
    }
    Promise.all([loadJSON("computed/kill-location.json"), loadJSON("computed/death-location.json")]).then(data => {
        const lds_max = calculateLDS(Math.max(data[0].length, data[1].length));
        largeHM("d10", data[0], lds_max);
        largeHM("d16", data[1], lds_max);
    });

    Promise.all([loadJSON("computed/kill-location-aram.json"), loadJSON("computed/death-location-aram.json")]).then(data => {
        const lds_max = calculateLDS(Math.max(data[0].length, data[1].length));
        largeHM("d60", data[0], lds_max);
        largeHM("d61", data[1], lds_max);
    });

    Promise.all([loadJSON("computed/kill-location-b.json"),
        loadJSON("computed/kill-location-p.json"),
        loadJSON("computed/death-location-b.json"),
        loadJSON("computed/death-location-p.json")
    ]).then(data => {
        const lds_max = calculateLDS(Math.max(data[0].length, data[1].length, data[2].length, data[3].length));
        largeHM("d12", data[0], lds_max);
        largeHM("d14", data[1], lds_max);
        largeHM("d18", data[2], lds_max);
        largeHM("d20", data[3], lds_max);
    });

    Promise.all([loadJSON("computed/kill-location-b-aram.json"),
        loadJSON("computed/kill-location-p-aram.json"),
        loadJSON("computed/death-location-b-aram.json"),
        loadJSON("computed/death-location-p-aram.json")
    ]).then(data => {
        const lds_max = calculateLDS(Math.max(data[0].length, data[1].length, data[2].length, data[3].length));
        largeHM("d62", data[0], lds_max);
        largeHM("d63", data[1], lds_max);
        largeHM("d64", data[2], lds_max);
        largeHM("d65", data[3], lds_max);
    });

    Promise.all([loadJSON("computed/kill-location-lane.json"), loadJSON("computed/death-location-lane.json")]).then(data => {
        const tmax = calculateSDS(Math.max(data[0]["1"].length, data[0]["2"].length, data[0]["3"].length, data[0]["4"].length, data[0]["5"].length,
                data[1]["1"].length, data[1]["2"].length, data[1]["3"].length, data[1]["4"].length, data[1]["5"].length));
        standardHM("d30", data[0]["1"], tmax);
        standardHM("d32", data[0]["2"], tmax);
        standardHM("d34", data[0]["3"], tmax);
        standardHM("d36", data[0]["4"], tmax);
        standardHM("d38", data[0]["5"], tmax);

        standardHM("d31", data[1]["1"], tmax);
        standardHM("d33", data[1]["2"], tmax);
        standardHM("d35", data[1]["3"], tmax);
        standardHM("d37", data[1]["4"], tmax);
        standardHM("d39", data[1]["5"], tmax);
    });
}

function loadJSON(path) {
    return new Promise((resolve, reject) => {
        var xobj = new XMLHttpRequest();
            xobj.overrideMimeType("application/json");
        xobj.open('GET', path, true); // Replace 'my_data' with the path to your file
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                resolve(JSON.parse(xobj.responseText));
            }
        };
        xobj.send(null);
    });
}


function $(id) {
    return document.getElementById(id);
}

function constrain(n, a, b) {
    let min = Math.min(a, b);
    let max = Math.max(a, b);
    return Math.min(Math.max(n, min), max);
}
