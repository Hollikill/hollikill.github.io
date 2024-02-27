// global loop variables
var deltams = 100;
var last1sec = 0;

// game progress
var unlockStage = 0;
var unlockreq = 10;
var unlockrate = 15;

// currency
var points = 0;
var pointsprogress = 0;

// boost mechanics
var pointboostcurrent = 0;
var pointboostmax = 1;
var pointdegradationrate = 0.2;
var pointdegradationprogress = 0;

// boost combo mechanics
var tempoavg = 0;
var lastclick = 0;
var tempocount = 0;
var temporange = 0.5;

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

// UI details
var logcolor = true;
var ratesviewable = true;
var logviewable = true;
var rviewable = true;
var statviewable = true;
var tempocolor = 0;
var darkmode = false;

// text details
var pgennames = ["Point Generator", "PG Assembly Line", "Point Condensator", "Stem Cell Growth Lab", "Condenser Shrine", "Nanobot Mining Cluster", "Point Factort MK 1", "Nanobot Replication Chamber", "Codensation Synagogue", "Nanobot Dispersal Assembly", "Point Factory MK 2", "Nanobot Internal Condenser", "Hypercondenser Nanocluster", "Superdense Point Depositer", "Tension Generator", "Hypercondenser Supercube", "Point Factory MK 3", "Hyperdense Point Refractor", "4D Ubercondenser", "Alternate Nanobot Metastate", "Extradimensional UberCondenser", "Macro-alignment Compensator", "Uberdense Enigma Rotator", "Tension-Density Nanoweaver", "NanoExUCD Manager", "Hypertension Skimmer", "7D Nanobot Refinery", "Nanobot Merging Cloud", "Macro-alignment Distributer", "Extradense Alignment Amplifier", "Nanobot Vortex Chamber", "Subsurface Tension Refiner", "Density Collecter", "Hyperspace Density Refractor", "Megatension Supernet Recaster", "Arbitration Alignment Machine"];
var pgenabbrs = ["pGen", "PGA", "PCD", "SCG", "CDS", "NC", "PFK1", "NRC", "CSG", "NDA", "PFK2", "NIC", "HCD", "SDD", "tGen", "HCD^2", "PFK3", "HDR", "HCD^3", "MTS", "ExUCD", "MAC", "UDR", "tWeaver", "NXM", "tSkim", "NRF", "NMC", "MAD", "ExA2", "NVTXC", "tSubRef", "DC", "HDRF", "tCastnet", "ARBA"];

// unlocks
var unlockkeys = [];

var GlobalLoop = function () {
    // unlock stages
    if ((points > unlockreq && unlockStage != 36 && unlockStage != 128) || (points > unlockreq && unlockkeys.includes("infinity0") && unlockStage != 128)) {
        LogText("log(self.threshold++);<br>self.threshold == "+unlockStage+";");
        unlockStage = unlockStage + 1;

        var ul = document.getElementsByClassName("ul"+unlockStage);
        for (let n of ul) {
            n.style.display = "inline";
        }
        CreatePGen();
        if (unlockStage == 1) {
            ToggleResearch();
            ToggleLog();
            ToggleRates();
            AdjustMusic();
            if (audio.paused == true)
                ToggleAudio();
            TriggerTempo();
            ChangeTempoColor(1);
        }
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

        unlockreq = (pgencostbase[pgencostbase.length-1])*2;
        unlockrate = unlockrate + 2;
    }
    
    // point boost calculations
    var boostdelaymult = 1;
    if (unlockkeys.includes("boost3"))
        boostdelaymult = boostdelaymult * 2;
    if (pointboostcurrent > pointboostmax) {
        pointboostmax = pointboostmax + 0.001;
        pointboostcurrent = Math.min(pointboostmax,pointboostcurrent);
    }
    pointdegradationprogress = pointdegradationprogress + (deltams/1000)
    var ubmult = 1;
    if ((unlockkeys.includes("unboost1") && unboosttime < unboostmax) || unlockkeys.includes("unboost3")) {
        ubmult = ubmult * Math.max(3, (unboostmax/100))
    }
    unboosttime = unboosttime + (deltams/1000)*ubmult;
    if (pointdegradationprogress > pointboostmax*boostdelaymult) {
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
            if (slocked) DegradeStatis(0.01);
            else StepStatis(50, 0.5);
        }

        if (audio.ended) {
            audio = new Audio('chill'+(Math.floor(1+(4*Math.random())))+'.mp3');
            audio.volume = bgvolume;
            audio.play();
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
            if (unlockkeys.includes("metagen2")) {
                metagenmult = metagenmult * (1+Math.log10(GetBoost()))
            }
        }
        if (unlockkeys.includes("unboost2")) {
            metagenmult = metagenmult * ubmult;
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
    UpdateTempo();
}

var ChangeText = function(id, x) {
    document.getElementById(id).innerHTML = x;
}

var ChangeNumber = function(id, x) {
    if (x > 100000000000000000000)
        ChangeNumberExpo(id, x);
    else {
        var tempnumeral = numeral(x).format('0,0.0a');
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
        var tempnumeral = numeral(x).format('0,0.00');
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
    var tempnumeral = Number(x).toExponential(2);
    if (tempnumeral != null)
    document.getElementById(id).innerHTML = tempnumeral;
}


var UpdatePoints = function() {
    ChangeNumberLong("pcount", points);
}

var UpdatePointBoost = function() {
    ChangeNumberLong("pboost", (pointboostcurrent+1));
    ChangeNumberLong("pboostmax", (pointboostmax+1));
    ChangeNumberFixed("pboostprog", unboosttime, 0);

    // unboost stored here too
    ChangeNumberLong("unboost", 1+(unboostmax/300));

    // total boost spot
    ChangeNumberFixed("totalboost", GetBoost(), 0);
}

var UpdatePGen = function(x) {
    ChangeNumber("pgen"+(x+1)+"count", pgen[x]);
    ChangeNumber("pgen"+(x+1)+"cost", pgencost[x]);
    var temp = CalcPGenRate(x);
    if (pgen[x] == 0 || pgenrate[x] == 0) {
        temp = 0;
    }
    ChangeNumber("pgen"+(x+1)+"rate", temp)
}

var ToggleRates = function() {
    if (ratesviewable) {
        ratesviewable = false;
        var rates = document.getElementsByClassName("pgenrate");
        for (var r of rates) {
            r.style.display = "none";
        }
    }
    else {
        ratesviewable = true;
        var rates = document.getElementsByClassName("pgenrate");
        for (var r of rates) {
            r.style.display = "inline";
        }
    }
    CategoryViewCheck();
}

var UpdateTotalRate = function() {
    var totalrate = 0
    for (let i = 0; i < pgen.length; i++) {
        totalrate = totalrate + CalcPGenRate(i);
    }
    ChangeNumber("totalprate", totalrate)
}

var UpdateStatis = function () {
    ChangeNumberLong("statismod", GetStatisMod());
    for (var i = 0; i < scaps.length; i++) {
        ChangeNumber("scap"+i, scaps[i])
    }
    ChangeNumberShort("statiscost", (100000000000*Math.pow(100, scaps.length)));
    var locktext = "";
    if (slocked) {
        locktext = "Statis Hypertension";
        document.getElementById("statisstate").classList.add("grainbow")
        document.getElementById("statisstate").classList.remove("unrainbow")
    } else {
        locktext = "Statis Flux";
        document.getElementById("statisstate").classList.add("unrainbow")
        document.getElementById("statisstate").classList.remove("grainbow")
    }
    ChangeText("statisstate", locktext)
}
 
var UpdateTempo = function() {
    ChangeNumberLong("tempoavg", tempoavg/1000);
    //ChangeNumberLong("tempocount", tempocount);
    ChangeNumberLong("tempobonus", pointboostmax/50);

    var d = new Date();
    var n = d.getTime();
    var thisdelay = n - lastclick;
    if (tempoavg*(1-temporange) < thisdelay && thisdelay < tempoavg*(1+temporange))
        if (tempocolor > 0)
            document.getElementById("tempodelay").style.color = "green";
        else
            document.getElementById("tempodelay").style.color = "black";
    else
        if (tempocolor > 1)
            document.getElementById("tempodelay").style.color = "red";
        else
            document.getElementById("tempodelay").style.color = "black";
    ChangeNumberLong("tempodelay", (thisdelay/1000));
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
    pgencost.push(100 * Math.pow(unlockrate, pgencost.length))
    pgencostbase.push(pgencost[pgencostbase.length])
    pgenrate.push(Math.pow(unlockrate, pgenrate.length))

    var pgenbr = document.createElement("br");
    var pgenstat = document.createElement("p");
    var name = ""+pgennames[pgen.length-1];
    if (name == "undefined") {
        name = "Building["+(pgen.length)+"]";
    }
    pgenstat.innerHTML = name+": <span id='pgen"+pgen.length+"count'>DNE</span>";
    pgenstat.style.display = "inline";
    document.getElementById("statcat").appendChild(pgenbr);
    document.getElementById("statcat").appendChild(pgenstat);

    var pgenratetext = document.createElement("span");
    pgenratetext.classList = "pgenrate";
    pgenratetext.innerHTML = "+<p id='pgen"+pgen.length+"rate'>DNE</p>/s<br>";
    document.getElementById("pgenrateholder").appendChild(pgenratetext);
    ToggleRates();
    ToggleRates();

    var abbr = ""+pgenabbrs[pgen.length-1];
    if (abbr == "undefined") {
        abbr = "B-"+(pgen.length);
    }
    var pgenbuybutton = document.createElement("div");
    pgenbuybutton.innerHTML="<button onclick='PGenBuy("+(pgen.length-1)+", 1, "+(1+(pgen.length/100))+")' class='pgenbuy'>Buy "+abbr+" (<span id='pgen"+pgen.length+"cost'>DNE</span>)</button>";
    document.getElementById("gencat").prepend(pgenbuybutton);
}

var PChange = function(x) {
    points = points + (x*GetBoost());
    pointdegradationprogress = 0;
    unboosttime = 0
    if (unlockkeys.includes("boost0")) {
        pointboostcurrent = pointboostcurrent + 0.01;
    }
    if (unlockkeys.includes("boost2")) {
        // THIS DOES NOT ALERT PLEASE
        TriggerTempo();
    }
}

var TriggerTempo = function () {
    var d = new Date();
    var n = d.getTime();
    var thisdelay = n - lastclick;
    if (lastclick == 0)
        thisdelay = 0;
    if (thisdelay/1000 > pointboostmax*2 || !unlockkeys.includes("boost3") && thisdelay/1000 > pointboostmax) {
        tempocount = 0;
        tempoavg = pointboostmax*500;
    }
    else {
        tempoavg = (tempoavg*(tempocount/(tempocount+1))) + (thisdelay/(tempocount+1));

        if (!(thisdelay > tempoavg*(1+temporange) || thisdelay < tempoavg*(1-temporange)) && unlockkeys.includes("boost2")) {
            pointboostcurrent = pointboostcurrent + (pointboostmax/50);
            if (pointboostcurrent > pointboostmax)
                pointboostmax = pointboostmax + 0.001;
            tempocount = tempocount + 1;
        }
    }
    lastclick = n;
}

var ChangeTempoColor = function (x) {
    tempocolor = x%3;
    ChangeNumber("tempomode", tempocolor);
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
            if (unboosttime >= cost && unlockkeys.includes("boost0")) {
                unboosttime = unboosttime - cost;
                canbuy = true;
            }
            break;
    }
    if (canbuy) {
        LogText("self.aquire("+ulid+");");
        unlockkeys.push(ulid);
        document.getElementById(ulid).remove()
        var ulelements = document.getElementsByClassName(ulid);
        for (let n of ulelements) {
            n.style.display = "inline";
        }
        document.getElementById("rcompleted").appendChild(document.getElementById(ulid+"holder"));
    }
}

var GetBoost = function () {
    return (1+(unboostmax/300))*(pointboostcurrent+1);
}

// bg audio loop
var audio = new Audio('chill1.mp3');
var bgvolume = 0;
audio.volume = bgvolume;

var ToggleAudio = function () {
    if (audio.paused) {
        audio.play();
        document.getElementById("mute").innerHTML = "Pause Music"
    } else {
        audio.pause();
        document.getElementById("mute").innerHTML = "Play Music"
    }
}

var AdjustMusic = function () {
    bgvolume = bgvolume + 0.2;
    if (bgvolume > 1) bgvolume = 0;
    audio.volume = bgvolume;
    ChangeNumber("volume", bgvolume)
}

var LogText = async function(text) {
    // create and format
    var logtext = document.createElement("div");
    logtext.innerHTML = text + "<br><br>";
    logtext.classList.add("logtext");
    var logcolor = logcolor;
    if (logcolor) {
        logcolor = false;
        logtext.style.backgroundColor = "rgb(200, 200, 200)";
    }
    else {
        logcolor = true;
        logtext.style.backgroundColor = "var(--b3)";
    }

    // add to log
    document.getElementById("logholder").prepend(logtext);

    // fade-out
    /*setTimeout( function() {
        logtext.remove();
    }, 600000);*/
}

var ToggleLog = function() {
    if (logviewable) {
        logviewable = false;
        document.getElementById("log").style.display = "none";
    }
    else {
        logviewable = true;
        document.getElementById("log").style.display = "inline";
    }
    CategoryViewCheck();
}

var ToggleResearch = function() {
    if (rviewable) {
        rviewable = false;
        document.getElementById("rcompleted").style.display = "none";
    }
    else {
        rviewable = true;
        document.getElementById("rcompleted").style.display = "inline";
    }
}

var ToggleStats = function() {
    if (statviewable) {
        statviewable = false;
        document.getElementById("statcat").style.display = "none";
    }
    else {
        statviewable = true;
        document.getElementById("statcat").style.display = "block";
    }
    CategoryViewCheck();
}

var CategoryViewCheck = function() {
    var catsenabled = 4;
    if (!statviewable && !ratesviewable && !logviewable) {
        document.getElementById("statholder").style.display = "none";
        catsenabled = catsenabled - 1;
    }
    else {
        document.getElementById("statholder").style.display = "inline";
    }
    
    // correct remaining cats width
    var cats = document.getElementById("maincatholder").children;
    for (var c of cats) {
        c.style.width = ((100-(5*catsenabled))/catsenabled)+"%";
    }
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

var ToggleNotify = function(x) {
    var blur = document.getElementById("blur");
    var notify = document.getElementById("notify"+x)
    if (blur.style.display == "none") {
        blur.style.display = "inline";
        notify.style.display = "inline";
    }
    else {
        blur.style.display = "none";
        var notifys = document.getElementsByClassName("notify");
        for (var n of notifys) {
            n.style.display = "none";
        }
    }
}

var ToggleDarkMode = function() {
    if (darkmode) {
        darkmode = false;
        document.getElementById("pagestyle").setAttribute("href", "light.css")
    }
    else {
        darkmode = true;
        document.getElementById("pagestyle").setAttribute("href", "dark.css")
    }
}