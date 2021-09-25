// prerequisite variables
var deltams = 25;

// game progress
var unlockStage = 0;
var unlockreq = 10;
var unlockrate = 20;

// currency
var points = 0;
var pointsprogress = 0;

// boost mechanics
var pointboostcurrent = 0;
var pointboostmax = 1;
var pointdegradationrate = 0.2;
var pointdegradationprogress = 0;

var unboostmax = 0;

// buildables
var pgen = [];
var pgenprogress = [];
var pgenbought = [];
var pgencost = [];
var pgencostbase = [];
var pgenrate = [];

// text details
var pgennames = ["Point Generator", "PG Assembly Line", "Point Condensator", "Stem Cell Growth Lab", "PCD Shrine", "Nanobot Mining Cluster", "Point Factort MK 1", "Nanobot Replication Chamber", "Codensation Synagogue", "Nanobot Dispersal Assembly", "Point Factory MK 2", "Nanobot Internal Condenser"]
var pgenabbrs = ["pGen", "PGA", "PCD", "SCG", "CDS", "NC", "PFK1", "NRC", "CSG", "NDA", "PFK2", "NIC"]

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
        CreatePGen();
        if (unlockStage == 2) {
            document.getElementById("pinstruct").remove();
        }
        if (unlockStage == 4) {
            document.getElementById("pcount").classList.add("unrainbow");
        }
    }
    
    // point boost calculations
    if (pointboostcurrent > pointboostmax) {
        pointboostmax = pointboostmax + 0.001;
        pointboostcurrent = Math.min(pointboostmax,pointboostcurrent);
    }
    pointdegradationprogress = pointdegradationprogress + (deltams/1000)
    if (pointdegradationprogress > pointboostmax) {
        pointboostcurrent = pointboostcurrent - (deltams/1000)*pointdegradationrate;
        if (pointboostcurrent < 0)
            pointboostcurrent = 0;
    }
    if (pointdegradationprogress > unboostmax && unlockkeys.includes("unboost0"))
        unboostmax = pointdegradationprogress;

    if (GetBoost() > 10) {
        document.getElementById("totalboost").classList.add("rainbow")
        document.getElementById("totalboost").classList.remove("unrainbow")
    }
    else if (GetBoost() > 2.5) {
        document.getElementById("totalboost").classList.remove("rainbow")
        document.getElementById("totalboost").classList.add("unrainbow")
    }
    else {
        document.getElementById("totalboost").classList.remove("unrainbow")
        document.getElementById("totalboost").classList.remove("rainbow")
    }

    // generation step
    for (let i = 0; i < pgen.length; i++) {
        var unlockmult = 1;
        if (unlockkeys.includes("metagen1")) {
            unlockmult = unlockmult / Math.pow(2, i);
        }
        points = points + (deltams/1000)*pgenrate[i]*pgen[i]*unlockmult*GetBoost();
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

    // progress rollover
    while (pointsprogress >= 1) {
        points = points + Math.round(pointsprogress)
        pointsprogress = pointsprogress%1;
    }
    for (let i = 0; i < pgen.length; i++) {
        while (pgenprogress[i] >= 1) {
            pgen[i] = pgen[i] + Math.round(pgenprogress[i]);
            pgenprogress[i] = pgenprogress[i]%1;
        }
    }

    // keep this last
    UpdateText();
}

window.onload=setInterval(GlobalLoop, deltams);

var UpdateText = function() {
    UpdatePoints();
    UpdatePointBoost();
    for (let i = 0; i < pgen.length; i++) {
        UpdatePGen(i);
    }
    UpdateTotalRate();
}

var ChangeText = function(id, x) {
    document.getElementById(id).innerHTML = x;
}

var ChangeNumber = function(id, x) {
    var tempnumeral = numeral(x).format('0,0.[00]a');
    if (tempnumeral != null)
    document.getElementById(id).innerHTML = tempnumeral;
}
var ChangeNumberShort = function(id, x) {
    var tempnumeral = numeral(x).format('0,0a');
    document.getElementById(id).innerHTML = tempnumeral;
}

var UpdatePoints = function() {
    ChangeNumberShort("pcount", points);
}

var UpdatePointBoost = function() {
    ChangeNumber("pboost", (pointboostcurrent+1));
    ChangeNumber("pboostmax", (pointboostmax+1));
    ChangeNumberShort("pboostprog", pointdegradationprogress);

    // unboost stored here too
    ChangeNumber("unboost", 1+(unboostmax/300));

    // total boost spot
    ChangeNumber("totalboost", GetBoost());
}

var UpdatePGen = function(x) {
    ChangeNumber("pgen"+(x+1)+"count", pgen[x]);
    ChangeNumber("pgen"+(x+1)+"cost", pgencost[x]);
    var temp = (" +"+(CalcPGenRate(x)).toFixed(0)+"/s");
    if (pgen[x] == 0 || pgenrate[x] == 0) {
        temp = "";
    }
    ChangeText("pgen"+(x+1)+"rate", temp)
}

var UpdateTotalRate = function() {
    var totalrate = 0
    for (let i = 0; i < pgen.length; i++) {
        totalrate = totalrate + CalcPGenRate(i);
    }
    ChangeNumber("totalprate", totalrate)
}

var CalcPGenRate = function(x) {
    var mult = 1;
    if (unlockkeys.includes("metagen1")) {
        mult = mult / Math.pow(2, x)
    }
    mult = mult * (1+pointboostcurrent)
    return (pgenrate[x]*pgen[x]*mult);
}

var CreatePGen = function() {
    pgen.push(0);
    pgenprogress.push(0);
    pgenbought.push(0);
    pgencost.push(100 * Math.pow(20, pgencost.length))
    pgencostbase.push(pgencost[pgencostbase.length])
    pgenrate.push(Math.pow(20, pgenrate.length))

    var pgenbr = document.createElement("br");
    var pgenstat = document.createElement("p");
    pgenstat.innerHTML = pgennames[pgen.length-1]+": <span id='pgen"+pgen.length+"count'>DNE</span>";
    pgenstat.style.display = "inline";
    document.getElementById("statcat").appendChild(pgenbr);
    document.getElementById("statcat").appendChild(pgenstat);

    var pgenratetext = document.createElement("span");
    pgenratetext.id = "pgen"+pgen.length+"rate";
    pgenratetext.classList = "pgenrate";
    pgenratetext.innerHTML = "DNE";
    document.getElementById("pgenrateholder").appendChild(pgenratetext);

    var pgenbuybr = document.createElement("br");
    var pgenbuybutton = document.createElement("div");
    pgenbuybutton.innerHTML="<button onclick='PGenBuy("+(pgen.length-1)+", 1, 1.0"+pgen.length+")'>Buy "+pgenabbrs[pgen.length-1]+" (<span id='pgen"+pgen.length+"cost'>DNE</span>)</button>";
    document.getElementById("gencat").appendChild(pgenbuybr);
    document.getElementById("gencat").appendChild(pgenbuybutton);
}

var PChange = function(x) {
    points = points + x;
    pointdegradationprogress = 0;
    if (unlockkeys.includes("boost0")) {
        pointboostcurrent = pointboostcurrent + 0.01;
    }
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
    UnlockBuy(ulid, cost, 0)
}

var UnlockBuy = function (ulid, cost, type) {
    var canbuy = false;
    switch (type) {
        case 0:
            if (points >= cost) {
                points = points - cost;
                canbuy = true;
            }
            break;
        case 1:
            if (pointdegradationprogress >= cost) {
                pointdegradationprogress = pointdegradationprogress - cost;
                canbuy = true;
            }
            break;
    }
    if (canbuy) {
        unlockkeys.push(ulid);
        document.getElementById(ulid).style.display = "none";
        var ulelements = document.getElementsByClassName(ulid);
        for (let n of ulelements) {
            n.style.display = "inline";
        }
    }
}

var GetBoost = function () {
    return (1+(unboostmax/300))*(pointboostcurrent+1);
}

// bg audio loop
var audio = new Audio('chill.mp3');
audio.loop = true;
audio.play();

var ToggleAudio = function () {
    if (audio.paused) {
        audio.play();
        document.getElementById("mute").innerHTML = "Pause Music"
    } else {
        audio.pause();
        document.getElementById("mute").innerHTML = "Play Music"
    }
}