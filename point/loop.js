var deltams = 100;

var updateneeds = [];
var curtab = "stage0";

var loadgamepoints = 0;

// object for storing savegame-relavent values
var gamedata = {
    points: new Decimal(0),

    currentboost: new Decimal(0),
    maxboost: new Decimal(1),
    boosttimereal: new Decimal(0),
    boosttime: new Decimal(0),
    boosttimemax: new Decimal(0),

    focus: new Decimal(1),  
    focuslimit: new Decimal(120),
    focusamount: new Decimal(0),

    stagekeys: [],

    buildcost: [],
    buildcostbase: [],
    buildcount: [],
    buildbought: [],

    unlock_viewable: [],
    unlock_bought: [],

    lasttime: new Decimal(0),

    title: "",
    unlocksetting: false,

    statispoints: [],
    statisaverage: {
        x: new Decimal(0),
        y: new Decimal(0),
        driftx: new Decimal(0),
        drifty: new Decimal(0),
    },
    statiscostbase: new Decimal(1e15),
    statiscostincreasefactor: new Decimal(1e2),

    decoderchance: new Decimal(0.1),
    decoderstring: "",
    decodercapacity: new Decimal(0),
    decoderfactor: new Decimal(1),

    version: "5t.7",
}

var total;

var LoadGamedata = (mode) => {
    switch (mode) {
        case 0:
            var savecodejson = "";
            navigator.clipboard.readText().then(text => {
                savecodejson = text;
            });
            break;
        case 1:
            var savecodejson = localStorage.getItem("savecodejson");
            break;
        case 2:
            var savecodejson = JSON.stringify(gamedata);
            ChangeTitle("A Game");
            if (localStorage.getItem("savecodejson")) {
                Notify("warn", "If you play here you will override a save with "+JSON.parse(localStorage.getItem("savecodejson")).points+" points.<br>Reload the page to load the saved game.");
            }
            else {
                Notify("warn", "this is NOT THE FULL VERSION OF THE GAME. this is purely a testing branch, and if you want to play the full and stable version of the game you should go to <a href='https://hollikill.net/point/game'>hollikill.net/point/game</a>.");
            }
            break;
    }

    var savecode = JSON.parse(savecodejson);
    if (savecode.version != gamedata.version) {
        alert("Save is incompatible, cannot load. Press OK to start a new game.")
        LoadGamedata(2);
        return;
    }

    gamedata.lasttime = savecode.lasttime;

    gamedata.points = new Decimal(savecode.points);
    loadgamepoints = new Decimal(savecode.points);

    gamedata.boosttimemax = new Decimal(savecode.boosttimemax);
    gamedata.boosttime = new Decimal(savecode.boosttime);
    gamedata.maxboost = new Decimal(savecode.maxboost);
    gamedata.currentboost = new Decimal(savecode.currentboost);

    gamedata.focus = new Decimal(savecode.focus);
    gamedata.focusamount = new Decimal(savecode.focusamount);

    for (var i = 0; i < savecode.buildcost.length; i++) {
        gamedata.buildcost.push(new Decimal(savecode.buildcost[i]));
        gamedata.buildcostbase.push(new Decimal(savecode.buildcostbase[i]));
        gamedata.buildcount.push(new Decimal(savecode.buildcount[i]));
        gamedata.buildbought.push(new Decimal(savecode.buildbought[i]));
    }

    gamedata.unlock_bought = savecode.unlock_bought;
    for (var ulid of savecode.unlock_viewable) {
        if (gamedata.unlock_bought.includes(ulid))
            gamedata.unlock_viewable.push(ulid);
    }

    if (gamedata.title != "A Game")
        ChangeTitle(savecode.title);
    
    for (var ulid of gamedata.unlock_bought) {
        TriggerUnlock(ulid);
    }

    if (savecode.statispoints.length > 0)
        CreateStatisPoint(savecode.statispoints.length);

    if (gamedata.unlock_bought.includes("decoder")) {
        gamedata.decoderfactor = new Decimal(savecode.decoderfactor);
        gamedata.decodercapacity = new Decimal(savecode.decodercapacity);
        gamedata.decoderstring = savecode.decoderstring;
        document.getElementById("decoderinput").value = gamedata.decoderstring;
    }

    HideElementID("startmenu");
    NavVisible(true);

    audio.play();

    CreateAudioSettings();
    CreateUnlockSettings();
    Navbar(curtab);

    Notify("alert", "You can [ right-click + drag ] to re-arragne all these boxes!<br><br>Have fun playing!");
}
var SaveGamedata = () => {
    localStorage.setItem("savecodejson", JSON.stringify(gamedata));
    //navigator.clipboard.writeText(JSON.stringify(gamedata));
    var d = new Date();
    document.getElementById("time").textContent = "SAVED ["+d.toLocaleString()+"]";
}

var PointButton = () => {
    gamedata.points = gamedata.points.plus(1);
    updateneeds.push("points");
    if (gamedata.unlock_bought.includes("boost"))
        gamedata.currentboost = gamedata.currentboost.add(0.01);
    gamedata.boosttimereal = new Decimal(0);
    gamedata.boosttime = new Decimal(0);
}

// this holds everything but functions and global variables
$.getScript("newstext.js", function() {
$.getScript("unlocks.js", function() {
$.getScript("drag.js", function() {
$.getScript("doccontrol.js", function() {
$.getScript("format.js", function() {
$(function() {

CreatePointButton();
NavVisible(false);
ChangeTitle("A Desolate Void, and a Changelog");
CreateNotifyToggles();

// this is the global loop
setInterval(function () {

    if (document.getElementById("navbar").display != "flex") {
        if (localStorage.getItem("savecodejson")) {
            DisplaySavecode(new Decimal(JSON.parse(localStorage.getItem("savecodejson")).lasttime));
        }
    }

    var delay = GetTime();
    SetTime();

    gamedata.points = gamedata.points.plus(BuildStep(delay));
    updateneeds.push("points");

    if (!gamedata.stagekeys.includes("p10") && gamedata.points >= 10) {
        gamedata.stagekeys.push("p10");

        CreateBuildings();

        CreateBuild(1);
        updateneeds.push("buildbuy");
        CreateBuild(gamedata.buildcount.length);

        CreatePPS();

        CreateNewsfeed();
        RefreshNewsfeed();

        if (gamedata.unlock_bought.length < 1) {
            ChangeTitle("A Game about Getting Points");
        }
        Navbar("stage0");

        if (loadgamepoints < 10)
            Notify("alert", "Congrats on your first 10 points...<br><br>Now, your first goal should be to get some sort of automatic point production set up.<br>Namely, in the form of a building.<br><br>You can see in the the building module, there is a button to buy B-1, or building one, for 100 points. (in engineer notation)<br><br>Those other numbers to the right of the building won't make sense yet, but should soon become obvious.");
    }
    if (gamedata.stagekeys.includes("p10")) {
        if (gamedata.points.compare(gamedata.buildcostbase[gamedata.buildcostbase.length-1].times(2)) >= 0) {
            CreateBuild(gamedata.buildcount.length+1);
            updateneeds.push("buildbuy");

            Notify("alert2", "New Building Unlocked!");
        }
    }

    if (gamedata.unlock_bought.includes("boost")) {
        gamedata.boosttimereal = gamedata.boosttimereal.plus(delay/1000);
        var mult = new Decimal(1);
        if (gamedata.unlock_bought.includes("remember") && gamedata.boosttime.compare(gamedata.boosttimemax) < 0)
            mult = mult.times(gamedata.boosttimemax.div(60));
        gamedata.boosttime = gamedata.boosttime.plus(new Decimal(delay/1000).times(mult));
    }
    if (gamedata.boosttime.compare(gamedata.boosttimemax) >= 0)
            gamedata.boosttimemax = gamedata.boosttime;
    if (gamedata.unlock_bought.includes("metagen")) {
        gamedata.focus = new Decimal(document.getElementById("focusslider").value);
        MetagenStep(delay);
        ValidateMetagen(true, delay);
    }
    if (gamedata.unlock_bought.includes("statis"))
        StatisStep(delay);

    CheckUnlockVisable();

    ValidateBoost();

    if (gamedata.unlock_bought.includes("decoder"))
        VerifyDecoderString();

    Update();

}, deltams);

setInterval(function () {
    if (gamedata.stagekeys.includes("p10")) {
        SaveGamedata();
        RefreshNewsfeed();
    }
    if (gamedata.unlock_bought.includes("decoder")) {
        VerifyDecoder();
    }
}, 20*1000);

});
});
});
});
});
});


var CreateBuild = (x) => {
    for (var i = 0; i < x; i++) {
        var curbuildcount = gamedata.buildcount.length;
        if (i == gamedata.buildcount.length) {
            gamedata.buildcount.push(new Decimal(0));
            gamedata.buildbought.push(new Decimal(0));
            var cost = new Decimal(100).times(new Decimal(15+(curbuildcount*3)).pow(curbuildcount));
            gamedata.buildcost.push(cost);
            gamedata.buildcostbase.push(cost);
        }
        var curbuildcount = i;
        if (!document.getElementById("buildcost"+i)) {
            var buybutton = document.createElement("button");
            buybutton.textContent = "B-"+(curbuildcount+1)+" [";
            var buildcosttext = document.createElement("span");
            buildcosttext.id = "buildcost"+curbuildcount;
            buybutton.appendChild(buildcosttext);
            buybutton.innerHTML = buybutton.innerHTML + "]";
            buybutton.setAttribute("onclick", "BuyBuild("+curbuildcount+")")

            var buildcount = document.createElement("span");
            var seperator = document.createElement("span");
            var buildbought = document.createElement("span");
            var buildrate = document.createElement("span");
            buildcount.id = "buildcount"+curbuildcount;
            buildbought.id = "buildbought"+curbuildcount;
            buildrate.id = "buildrate"+curbuildcount;
            seperator.textContent = " ";
            seperator.append(buildbought);
            seperator.innerHTML = seperator.innerHTML + " (+";
            seperator.append(buildcount);
            seperator.innerHTML = seperator.innerHTML + ") at [+";
            seperator.append(buildrate);
            seperator.innerHTML = seperator.innerHTML + " points]";

            document.getElementById("buildbuyholder").prepend(document.createElement("br"));
            document.getElementById("buildbuyholder").prepend(seperator);
            document.getElementById("buildbuyholder").prepend(buybutton);
        }
    }
}

function BuyBuild(x) {
    if (gamedata.points.compare(gamedata.buildcost[x].times(GetDecoderBoost)) >= 0) {
        gamedata.points = gamedata.points.sub(gamedata.buildcost[x].times(GetDecoderBoost));

        gamedata.buildbought[x] = gamedata.buildbought[x].plus(1);
        gamedata.buildcount[x] = gamedata.buildcount[x].plus(1);
        gamedata.buildcost[x] = new Decimal(gamedata.buildcostbase[x]).times(new Decimal(1.01).pow(gamedata.buildbought[x]));
    }
    updateneeds.push("buildbuy");
    updateneeds.push("points");
}

function BuildStep(deltams) {
    total = new Decimal(0);

    for (var i = 0; i < gamedata.buildcount.length; i++) {
        if (gamedata.buildcount[i].compare(0) > -1) {
            var addition = new Decimal(15+(2*i)).pow(i).times(deltams/1000).times(gamedata.buildcount[i].floor());
            if (gamedata.unlock_bought.includes("metagen")) {
                addition = addition.times(gamedata.focus.pow(i+1).pow(2));
                if (ValidateMetagen(false))
                    total = total.plus(addition);
            }
            else {
                total = total.plus(addition);
            }
        }
    }

    total = total.times(GetBoost());

    return total;
}

function CheckUnlockVisable() {
    for (var ul of unlocks) {
        var visible = true;

        if (gamedata.unlock_viewable.includes(ul.id))
            visible = false;

        if (ul.pointreq != null) {
            if (gamedata.points.compare(ul.pointreq) < 0)
                visible = false;
        }
        if (ul.timereq != null) {
            if (gamedata.boosttimemax.compare(ul.timereq) < 0)
                visible = false;
        }
        if (ul.unlockreq != null) {
            for (var ulid of ul.unlockreq) {
                if (!gamedata.unlock_bought.includes(ulid))
                    visible = false;
            }
        }

        if (visible) {
            CreateUnlock(ul.id, ul.name, ul.description, ul.cost, ul.costtype);
            gamedata.unlock_viewable.push(ul.id);
            Navbar(curtab);
        }
    }
}

function BuyUnlock (id, e) {
    for (var ul of unlocks) {
        var canbuy = false;

        if (ul.id == id) {
            switch (ul.costtype) {
                case "point":
                    if (gamedata.points.compare(ul.cost) >= 0) {
                        canbuy = true;
                        gamedata.points = gamedata.points.minus(ul.cost);
                    }
                    break;
                case "time":
                        if (gamedata.boosttime.compare(ul.cost) >= 0) {
                            canbuy = true;
                            gamedata.boosttime = gamedata.boosttime.minus(ul.cost);
                        }
                        break;
            }
        }

        if (canbuy) {
            TriggerUnlock(ul.id);
            gamedata.unlock_bought.push(ul.id);
            e.textContent = "Bought";
            e.setAttribute("onclick", "");
            e.parentElement.classList.add("ul");
            if (!gamedata.unlocksetting)
                e.parentElement.style.visibility = "hidden";
        }
    }
}

function TriggerUnlock (id) {
    switch (id) {
        case "boost":
            CreateBoost();
            if (!gamedata.unlock_bought.includes(id)) {
                Notify("alert2", "Boosting system aquired!<br><br>To use the system, simply press the point button repeatedly in quick succcession.<br><br>You can monitor your boost stats in the boost module.<br>All production is multiplied by the total boost.");
                ChangeTitle("A Game about Getting Points using Boost");
            }
            break;
        case "metagen":
            CreateMetaSlider();
            if (!gamedata.unlock_bought.includes(id)) {
                Notify("alert2", "You can now channel your focus!<br><br>To use the system, just move the slider labeled focus to focus on what you want to.<br><br>Low focus levels will lower your point prouction drastically, but your building will also produce buildings of the tiers below them. For example, B-3 buildings will make some amount of B-2 buildings per second. These amounts are not listed.<br><br>However! this comes with a downside as well. If your focus is too much toward one side, your drift will increase. At maximum drift, your focus will lapse and all production will stop.");
                ChangeTitle("A Game about Getting a Lot of B-1");
            }
            break;
        case "unboost":
            CreateUnboost();
            if (!gamedata.unlock_bought.includes(id)) {
                Notify("alert2", "The mysterious energy has merged with your button!<br><br>To use the system, simply increase your unboosted time. The maximum amount that you have ever gotten in unboosted time is saved, and you get a multiplier based on that.");
                ChangeTitle("A Game about the Waiting");
            }
            break;
        case "boostdelay":
            if (!gamedata.unlock_bought.includes(id)) {
                Notify("alert2", "The glue machine has been set up!<br>It's sticky, though.<br><br>It provides +"+(gamedata.boostmult-1)+" seconds to delay at time of purchase, which will increase with the maximum boost.");
            }
            break;
        case "statis":
            CreateStatis();
            CreateStatisPoint(0);
            if (!gamedata.unlock_bought.includes(id)) {
                Notify("alert2", "The staticonflux information unit has been built!<br><br>It's a bit unintuitive, so you might wanna read this.<br><br>To use the system, you need to purchase one or more staticonfluxi. These staticonfluxi will randomly move around the statis chamber. Depending on how close the AVERAGE (represented in green) of all staticonfluxi (represented in blue) is to the black cross indicating the center, your boost will degrade at a rate multiplied by your statis factor.");
                ChangeTitle("A Game with a Polka-Dot Square");
            }
            break;
        case "statistime":
            CreateStatisPoint(5);
            if (!gamedata.unlock_bought.includes(id)) {
                Notify("alert2", "You have produced 5 StatiConfluxi!");
            }
            break;
        case "remember":
            if (!gamedata.unlock_bought.includes(id)) {
                Notify("alert2", "The prediction machine has prodcued its first hyperaccelration plan!<br><br>You will now regain time up to your best unboost time faster, always reaching the maximum in one minute.");
            }
            break;
        case "decoder":
            CreateDecoderPuzzle();
            gamedata.decodercapacity = new Decimal(1);
            if (!gamedata.unlock_bought.includes(id)) {
                Notify("alert2", "The MetaStock-Analyzer has finished creation!<br><br>To use it, first navigate to the new page by pressing the button at the top. Once you've done that, you can use the analyzer by simply typing in what you think is the best set of random character to predict the stock market, and every 20 seconds the machine will give an updated stock report.<br><br>The amount of Tries-to-Crack your key will influence the cost of buildings for you.");
                ChangeTitle("A Game with a Password")
            }
            break;
    }
}

function GetBoost () {
    var boostmult = new Decimal(1);

    boostmult = boostmult.times(gamedata.currentboost.add(1));

    if (gamedata.unlock_bought.includes("unboost"))
        boostmult = boostmult.times(GetBoosttimeMult());

    return new Decimal(boostmult);
}

function GetBoosttimeMult () {
    var boostmult = new Decimal(1);

    boostmult = boostmult.times(gamedata.boosttimemax.times(0.003).plus(1));

    return boostmult;
}

function ValidateBoost () {
    if (gamedata.currentboost.compare(gamedata.maxboost) > 0) {
        gamedata.maxboost = gamedata.maxboost.add(0.001);
        gamedata.currentboost = gamedata.maxboost;
    }

    var delay = new Decimal(1);
    if (gamedata.unlock_bought.includes("boostdelay"))
        delay = gamedata.maxboost;
    if (gamedata.boosttimereal.compare(delay) > 0) {
        if (gamedata.unlock_bought.includes("statis"))
            gamedata.currentboost = gamedata.currentboost.minus(new Decimal((deltams/1000)*(0.2)).times(GetStatisFactor()));
        else
            gamedata.currentboost = gamedata.currentboost.minus((deltams/1000)*(0.2));
        if (gamedata.currentboost.compare(0) < 0)
            gamedata.currentboost = new Decimal(0); 
    }
}

function SetTime () {
    var d = new Date();
    var n = d.getTime();
    gamedata.lasttime = new Decimal(n);
}

function GetTime () {
    var d = new Date();
    var n = d.getTime();
    var delay = new Decimal(n).minus(gamedata.lasttime);

    return delay;
}

function MetagenStep (deltams) {
    for (var i = 1; i < gamedata.buildcount.length; i++) {
        if (gamedata.buildcount[i].compare(0) > -1 && ValidateMetagen(false, deltams)) {
            gamedata.buildcount[i-1] = gamedata.buildcount[i-1].plus(gamedata.buildcount[i].floor().times(new Decimal(1).minus(gamedata.focus).times(0.01)));
        }
    }
}

function ValidateMetagen (dochange, deltams) {
    var mult = new Decimal(1);
    if (gamedata.focus.plus(-0.5).sign != gamedata.focusamount.sign) {
        mult = mult.times(20);
    }

    if (dochange) {
        gamedata.focusamount = gamedata.focusamount.plus(gamedata.focus.minus(0.5).times(mult).times(deltams.div(1000)));
        if (gamedata.focusamount.abs().compare(gamedata.focuslimit) >= 0) {
            if (gamedata.focusamount.compare(0) < 0)
                gamedata.focusamount = gamedata.focuslimit.neg();
            else
                gamedata.focusamount = gamedata.focuslimit;
        }
    }

    if (gamedata.focusamount.abs().compare(gamedata.focuslimit) < 0)
        return true;
    else
        return false;
}

function CreateStatisPoint (x) {
    if (x != 0) {
        for (var i = 0; i < x; i++) {
            gamedata.statispoints.push({
                x: new Decimal(15*Math.random()),
                y: new Decimal(15*Math.random()),
                driftx: new Decimal((1*Math.random())-0.5),
                drifty: new Decimal((1*Math.random())-0.5),
            });
    
            var pointdiv = document.createElement("div");
            pointdiv.classList.add("statispoint");
            pointdiv.id = ("statispoint"+(gamedata.statispoints.length-1));
            document.getElementById("statismap").append(pointdiv);
        }
    }
    else {
        var pointdiv = document.createElement("div");
        pointdiv.classList.add("statispoint");
        pointdiv.classList.add("statispointavg");
        pointdiv.id = ("statispointavg");
        document.getElementById("statismap").append(pointdiv);
    }
}

function StatisStep (deltams) {
    deltams = deltams.div(1000);
    var avg = {
        x:new Decimal(0),
        y:new Decimal(0),
        driftx:new Decimal(0),
        drifty:new Decimal(0),
    };
    for (var i = 0; i < gamedata.statispoints.length; i++) {
        var p = gamedata.statispoints[i];
        var pointdiv = document.getElementById("statispoint"+i);

        p.x = modulo(p.x.plus(p.driftx.times(deltams)), new Decimal(15));
        pointdiv.style.left = p.x.plus(0.5)+"em";

        p.y = modulo(p.y.plus(p.drifty.times(deltams)), new Decimal(15));
        pointdiv.style.top = p.y.plus(0.5)+"em";

        avg.x = avg.x.plus(p.x);
        avg.y = avg.y.plus(p.y);
        avg.driftx = avg.driftx.plus(p.driftx);
        avg.drifty = avg.drifty.plus(p.drifty);
    }
    if (gamedata.statispoints.length > 0) {
        gamedata.statisaverage.x = avg.x.div(gamedata.statispoints.length).plus(-7.5);
        gamedata.statisaverage.y = avg.y.div(gamedata.statispoints.length).plus(-7.5);
        gamedata.statisaverage.driftx = avg.driftx.div(gamedata.statispoints.length);
        gamedata.statisaverage.drifty = avg.drifty.div(gamedata.statispoints.length);
        var pointavgdiv = document.getElementById("statispointavg");
        pointavgdiv.style.left = avg.x.div(gamedata.statispoints.length).plus(0.5)+"em";
        pointavgdiv.style.top = avg.y.div(gamedata.statispoints.length).plus(0.5)+"em";
    }
    else {
        var pointavgdiv = document.getElementById("statispointavg");
        pointavgdiv.style.left = "8em";
        pointavgdiv.style.top = "8em";
    }
}

function GetStatisFactor () {
    var distance = gamedata.statisaverage.x.abs().plus(gamedata.statisaverage.y.abs()).div(15);
    return distance;
}

function BuyStatis () {
    if (gamedata.points.compare(gamedata.statiscostbase.times(gamedata.statiscostincreasefactor.pow(gamedata.statispoints.length+1))) >= 0) {
        gamedata.points = gamedata.points.plus(gamedata.statiscostbase.times(gamedata.statiscostincreasefactor.pow(gamedata.statispoints.length+1)).neg());
        CreateStatisPoint(1);
    }
}

function VerifyDecoderString () {
    var input = document.getElementById("decoderinput");
    if (input.value.length >= gamedata.decodercapacity) {
        input.value = input.value.substring(0, gamedata.decodercapacity);
    }
    gamedata.decoderstring = input.value;
}

function VerifyDecoder () {
    VerifyDecoderString();

    gamedata.decoderfactor = new Decimal(0);
    var done = false;
    var keylist = [];
    for (var i = 0; i < gamedata.decoderstring.length; i++) {
        keylist.push(false);
    }

    while (!done) {
        gamedata.decoderfactor = gamedata.decoderfactor.plus(keylist.length);
        var tempdone = true;
        for (var val of keylist) {
            if (!val) {
                var value = new Decimal(Math.random()).plus(gamedata.decoderchance.neg());
                if (value.compare(0) < 0) {
                    keylist.pop();
                }
                else {
                    tempdone = false;
                }
            }
        }
        if (tempdone) {
            done = true;
        }
    }
}

function BuyDecoder () {
    var tempcost = new Decimal(10).pow(gamedata.decodercapacity.plus(1));
    if (gamedata.boosttime.compare(tempcost) >= 0) {
        gamedata.boosttime = gamedata.boosttime.plus(tempcost.neg());

        gamedata.decodercapacity = gamedata.decodercapacity.plus(1);
    }
}

function GetDecoderBoost () {
    if (gamedata.unlock_bought.includes("decoder") && gamedata.decoderfactor.compare(0) != 0)
        return new Decimal(10).pow(gamedata.decoderfactor.log2().neg());
    else
        return new Decimal(1);
}