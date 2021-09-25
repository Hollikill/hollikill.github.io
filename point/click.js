// global loop variables
var deltams = 100;
var last1sec = 0;

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

// unboost mechanics
var unboostmax = 0;
var unboosttime = 0;

// statis mechanics
var scaps = [];
var slocked = false;

// buildables
var pgen = [];
var pgenprogress = [];
var pgenbought = [];
var pgencost = [];
var pgencostbase = [];
var pgenrate = [];

// text details
var pgennames = ["Point Generator", "PG Assembly Line", "Point Condensator", "Stem Cell Growth Lab", "Condenser Shrine", "Nanobot Mining Cluster", "Point Factort MK 1", "Nanobot Replication Chamber", "Codensation Synagogue", "Nanobot Dispersal Assembly", "Point Factory MK 2", "Nanobot Internal Condenser", "Hypercondenser Nanocluster", "Superdense Point Depositer", "Tension Generator", "Hypercondenser Supercube", "Point Factory MK 3", "Hyperdense Point Refractor", "4D Ubercondenser", "Alternate Nanobot Metastate", "Extradimensional UberCondenser", "Macro-alignment Compensator", "Uberdense Enigma Rotator", "Tension-Density Nanoweaver", "NanoExUCD Manager", "Hypertension Skimmer"];
var pgenabbrs = ["pGen", "PGA", "PCD", "SCG", "CDS", "NC", "PFK1", "NRC", "CSG", "NDA", "PFK2", "NIC", "HCD", "SDD", "tGen", "HCD^2", "PFK3", "HDR", "HCD^3", "MTS", "HCD^4", "MAC", "UDR", "tWeaver", "NXM", "tSkim"];

// unlocks
var unlockkeys = [];

var GlobalLoop = function () {
    // unlock stages
    if (points > unlockreq) {
        LogText("Surpassed Threshold Alpha-"+unlockStage);
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
        if (unlockStage == 5) {
            document.getElementById("pcount").classList.add("grainbow");
        }
        if (unlockStage == 13) {
            document.getElementById("pcount").classList.remove("grainbow");
            document.getElementById("pcount").classList.add("unrainbow");
        }
        if (unlockStage == 24) {
            document.getElementById("pcount").classList.remove("unrainbow");
            document.getElementById("pcount").classList.add("rainbow");
        }
    }
    
    // point boost calculations
    if (pointboostcurrent > pointboostmax) {
        pointboostmax = pointboostmax + 0.001;
        pointboostcurrent = Math.min(pointboostmax,pointboostcurrent);
    }
    pointdegradationprogress = pointdegradationprogress + (deltams/1000)
    var ubmult = 1;
    if (unlockkeys.includes("unboost1") && unboosttime < unboostmax) {
        ubmult = ubmult * Math.max(3, (unboostmax/100))
    }
    unboosttime = unboosttime + (deltams/1000)*ubmult;
    if (pointdegradationprogress > pointboostmax) {
        pointboostcurrent = pointboostcurrent - (deltams/1000)*pointdegradationrate*(1/Math.max(GetStatisMod(),0));
        if (pointboostcurrent < 0)
            pointboostcurrent = 0;
    }
    if (unboosttime > unboostmax && unlockkeys.includes("unboost0"))
        unboostmax = unboosttime;

    // boost coloration
    if (GetBoost() > 25) {
        document.getElementById("totalboost").classList.add("rainbow")
        document.getElementById("totalboost").classList.remove("grainbow")
        document.getElementById("totalboost").classList.remove("unrainbow")
    }
    else if (GetBoost() > 10) {
        document.getElementById("totalboost").classList.add("unrainbow")
        document.getElementById("totalboost").classList.remove("grainbow")
        document.getElementById("totalboost").classList.remove("rainbow")
    }
    else if (GetBoost() > 2.5) {
        document.getElementById("totalboost").classList.remove("rainbow")
        document.getElementById("totalboost").classList.remove("unrainbow")
        document.getElementById("totalboost").classList.add("grainbow")
    }
    else {
        document.getElementById("totalboost").classList.remove("grainbow")
        document.getElementById("totalboost").classList.remove("unrainbow")
        document.getElementById("totalboost").classList.remove("rainbow")
    }

    // statis step
    var d = new Date();
    var n = d.getTime();
    if (n > (last1sec+1000)) {
        last1sec = n;

        if (unlockkeys.includes("boost1")) {
            if (slocked) DegradeStatis(0.002);
            else StepStatis(35, 0.2);
        }
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
    UpdateStatis();
}

var ChangeText = function(id, x) {
    document.getElementById(id).innerHTML = x;
}

var ChangeNumber = function(id, x) {
    if (x > 100000000000000000000)
        ChangeNumberExpo(id, x);
    else {
        var tempnumeral = numeral(x).format('0,0.[00]a');
        if (tempnumeral != null)
        document.getElementById(id).innerHTML = tempnumeral;
    }
}
var ChangeNumberShort = function(id, x) {
    if (x > 100000000000000000000)
        ChangeNumberExpo(id, x);
    else {
        var tempnumeral = numeral(x).format('0,0a');
        if (tempnumeral != null)
        document.getElementById(id).innerHTML = tempnumeral;
    }
}
var ChangeNumberLong = function(id, x) {
    if (x > 100000000000000000000)
        ChangeNumberExpo(id, x);
    else {
        var tempnumeral = numeral(x).format('0,0.0[0]');
        if (tempnumeral != null)
        document.getElementById(id).innerHTML = tempnumeral;
    }
}
var ChangeNumberFixed = function(id, x, decimals) {
    if (x > 100000000000000000000)
        ChangeNumberExpo(id, x);
    else {
        var tempnumeral = x.toFixed(decimals)
        if (tempnumeral != null)
        document.getElementById(id).innerHTML = tempnumeral;
    }
}
var ChangeNumberExpo = function (id, x) {
    var tempnumeral = Number(x).toExponential(5);
    if (tempnumeral != null)
    document.getElementById(id).innerHTML = tempnumeral;
}


var UpdatePoints = function() {
    ChangeNumberLong("pcount", points);
}

var UpdatePointBoost = function() {
    ChangeNumber("pboost", (pointboostcurrent+1));
    ChangeNumber("pboostmax", (pointboostmax+1));
    ChangeNumberFixed("pboostprog", unboosttime, 0);

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

var UpdateStatis = function () {
    ChangeNumber("statismod", GetStatisMod());
    for (var i = 0; i < scaps.length; i++) {
        ChangeNumber("scap"+i, scaps[i])
    }
    ChangeNumberShort("statiscost", (100000000000*Math.pow(100, scaps.length)));
    var locktext = "";
    if (slocked) {
        locktext = "Statis Locked";
        document.getElementById("statisstate").classList.add("grainbow")
        document.getElementById("statisstate").classList.remove("unrainbow")
    } else {
        locktext = "Statis Hypertension";
        document.getElementById("statisstate").classList.add("unrainbow")
        document.getElementById("statisstate").classList.remove("grainbow")
    }
    ChangeText("statisstate", locktext)
}

var CalcPGenRate = function(x) {
    var mult = 1;
    if (unlockkeys.includes("metagen1")) {
        mult = mult / Math.pow(2, x)
    }
    mult = mult * GetBoost();
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
    points = points + (x*GetBoost());
    pointdegradationprogress = 0;
    unboosttime = 0
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
            if (unboosttime >= cost) {
                unboosttime = unboosttime - cost;
                canbuy = true;
            }
            break;
    }
    if (canbuy) {
        LogText("Bought "+ulid);
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

var logcolor = true;

var LogText = async function(text) {
    // create and format
    var logtext = document.createElement("div");
    logtext.innerHTML = text + "<br>";
    logtext.classList.add("logtext");
    var logcolor = logcolor;
    if (logcolor) {
        logcolor = false;
        logtext.style.backgroundColor = "rgb(200, 200, 200)";
    }
    else {
        logcolor = true;
        logtext.style.backgroundColor = "lightgray";
    }

    // add to log
    document.getElementById("logholder").prepend(logtext);

    // fade-out
    setTimeout( function() {
        
        setTimeout( function() {
            logtext.remove();
        }, 300000);
    }, 5000);
}

var LockStatis = function() {
    if (slocked) slocked = false;
    else slocked = true;
}

var GetStatisMod  = function() {
    var stotal = 0;
    for (var s of scaps) {
        stotal = stotal + s;
    }
    return (1+stotal)
}

var StepStatis = function(x, y) {
    for (var i = 0; i < scaps.length; i++) {
        scaps[i] = x*(Math.random()-y)
    }
}

var DegradeStatis = function(x) {
    for (var i = 0; i < scaps.length; i++) {
        if (scaps[i] > 0) {
            scaps[i] = scaps[i]-x;
            if (scaps[i] < 0) scaps[i] = 0;
        }
        else if (scaps[i] < 0) {
            scaps[i] = scaps[i]+x;
            if (scaps[i] > 0) scaps[i] = 0;
        }
    }
}

var BuyStatis = function() {
    cost = 100000000000*Math.pow(100, scaps.length);
    if (points >= cost) {
        points = points - cost;

        document.getElementById("statisholder").innerHTML = document.getElementById("statisholder").innerHTML + "<p class='scap' id='scap"+scaps.length+"'></p><br>";
        scaps.push(0);
    }
}