// prerequisite variables
var deltams = 25;

// game progress
var unlockStage = 0;
var unlockreq = 10;
var unlockrate = 25;

// currency
var points = 0;
var pointsprogress = 0;

// buildables
var pgen = [0, 0];
var pgenprogress = [0, 0];
var pgenbought = [0, 0];
var pgencost = [100, 2000];
var pgencostbase = [100, 2000];
var pgenrate = [1, 15];

// unlocks
var unlockkeys = [];

var GlobalLoop = function () {
    // unlock stages
    if (points > unlockreq) {
        unlockStage = unlockStage + 1;
        unlockreq = unlockreq * unlockrate;

        var ul = document.getElementsByClassName("ul"+unlockStage);
        for (let n of ul) {
            n.style.display = "inline";
        }
        if (unlockStage > 1) {
            CreatePGen();
        }
    }
    
    for (let i = 0; i < pgen.length; i++) {
        var unlockmult = 1;
        if (unlockkeys.includes("metagen1")) {
            unlockmult = unlockmult / Math.pow(2, i);
        }
        points = points + (deltams/1000)*pgenrate[i]*pgen[i]*unlockmult;
    }
    if (unlockkeys.includes("metagen0")) {
        var metagenmult = .05;
        if (unlockkeys.includes("metagen1")) {
            metagenmult = metagenmult * 2
        }
        for (let i = 1; i < pgen.length; i++) {
            pgenprogress[i-1] = pgenprogress[i-1] + (deltams/1000)*pgen[i]*metagenmult;
        }
    }

    while (pointsprogress >= 1) {
        pointsprogress = pointsprogress-1;
        points = points + 1;
    }
    for (let i = 0; i < pgen.length; i++) {
        while (pgenprogress[i] >= 1) {
            pgenprogress[i] = pgenprogress[i]-1;
            pgen[i] = pgen[i] + 1;
        }
    }

    // keep this last
    UpdateText();
}

window.onload=setInterval(GlobalLoop, deltams);

var UpdateText = function() {
    UpdatePoints();
    for (let i = 0; i < pgen.length; i++) {
        UpdatePGen(i);
    }
}

var ChangeText = function(id, x) {
    document.getElementById(id).innerHTML = x;
}

var ChangeNumber = function(id, x) {
    document.getElementById(id).innerHTML = x.toFixed(0);
}
var ChangeNumber = function(id, x, decimal) {
    document.getElementById(id).innerHTML = x.toFixed(decimal);
}

var UpdatePoints = function() {
    ChangeNumber("pcount", points);
}

var UpdatePGen = function(x) {
    ChangeNumber("pgen"+(x+1)+"count", pgen[x]);
    ChangeNumber("pgen"+(x+1)+"cost", pgencost[x], 1);
    var mult = 1;
    if (unlockkeys.includes("metagen1")) {
        mult = mult / Math.pow(2, x)
    }
    var temp = (" +"+(pgenrate[x]*pgen[x]*mult)+"/s");
    if (pgen[x] == 0 || pgenrate == 0 || mult == 0) {
        temp = "";
    }
    ChangeText("pgen"+(x+1)+"rate", temp)
}

var CreatePGen = function() {
    pgen.push(0);
    pgenprogress.push(0);
    pgenbought.push(0);
    pgencost.push(100 * Math.pow(15, pgencost.length))
    pgencostbase.push(pgencost[pgencostbase.length])
    pgenrate.push(Math.pow(15, pgenrate.length))

    /// TODO: add stat cat update, add rate update, add buy button update
    var pgenbr = document.createElement("br");
    var pgenstat = document.createElement("p");
    pgenstat.innerHTML = "PGA^"+(pgen.length-1)+": <span id='pgen"+pgen.length+"count'>DNE</span>";
    pgenstat.style.display = "inline";
    document.getElementById("statcat").appendChild(pgenbr);
    document.getElementById("statcat").appendChild(pgenstat);

    var pgenratetext = document.createElement("span");
    pgenratetext.id = "pgen"+pgen.length+"rate";
    pgenratetext.innerHTML = "DNE";
    document.getElementById("pcountholder").appendChild(pgenratetext);

    var pgenbuybr = document.createElement("br");
    var pgenbuybutton = document.createElement("div");
    pgenbuybutton.innerHTML="<button onclick='PGenBuy("+(pgen.length-1)+", 1, 1.0"+pgen.length+")'>Buy PGA^"+(pgen.length-1)+" (<span id='pgen"+pgen.length+"cost'>DNE</span>)</button>";
    document.getElementById("gencat").appendChild(pgenbuybr);
    document.getElementById("gencat").appendChild(pgenbuybutton);
}

var PChange = function(x) {
    points = points + x;
}

var PGenBuy = function (x, amount, itr) {
    if (points >= pgencost[x]*amount) {
        points = points - (pgencost[x]*amount);
        pgen[x] = pgen[x] + amount;
        pgenbought[x] = pgenbought[x] + amount;
        pgencost[x] = pgencostbase[x] * Math.pow(itr, pgenbought[x]);
    }
}

var UnlockBuy = function (ulid, cost) {
    if (points >= cost) {
        points = points - cost;
        unlockkeys.push(ulid);
        document.getElementById(ulid).style.display = "none";
    }
}