var deltams = 100;

var updateneeds = [];
var curtab = "stage0";

var loadgamepoints = 0;

// object for storing savegame-relavent values
var gamedata = {
    points: new Decimal(0),

    currentboost: new Decimal(0),
    maxboost: new Decimal(1),
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

    lasttime: 0,

    unlocksetting: false,

    version: "5t.4",
}

var total;

var LoadGamedata = (mode) => {
    ChangeTitle("A Game");

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
            if (localStorage.getItem("savecodejson"))
                ChangeTitle("YOUR SAVE MIGHT BE OVERWRITTEN IF YOU CONTINUE");
                Notify("warn", "If you play here you will override a save with "+JSON.parse(localStorage.getItem("savecodejson")).points+" points.<br>Reload the page to load the saved game.");
            break;
    }

    var savecode = JSON.parse(savecodejson);

    gamedata.lasttime = savecode.lasttime;

    gamedata.points = new Decimal(savecode.points);
    loadgamepoints = new Decimal(savecode.points);

    gamedata.boosttimemax = new Decimal(savecode.boosttimemax);
    gamedata.boosttime = new Decimal(savecode.boosttime);
    gamedata.boostmax = new Decimal(savecode.boostmax);
    gamedata.currentboost = new Decimal(savecode.currentboost);

    gamedata.focus = new Decimal(savecode.focus);
    gamedata.focusamount = new Decimal(savecode.focusamount);
    gamedata.focuslimit = new Decimal(savecode.focuslimit);

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

    for (var ulid of gamedata.unlock_bought) {
        TriggerUnlock(ulid);
    }

    HideElementID("startmenu");
    NavVisible(true);

    audio.play();

    CreateAudioSettings();
    CreateUnlockSettings();
    Navbar(curtab);

    Notify("warn", "this is NOT THE FULL VERSION OF THE GAME. this is purely a testing enviroment for new features or reworks of old features, and if you want to play the full game you should go to <a href='https://hollikill.net/point/game'>hollikill.net/point/game</a>.")
}
var SaveGamedata = () => {
    localStorage.setItem("savecodejson", JSON.stringify(gamedata));
    navigator.clipboard.writeText(JSON.stringify(gamedata));
}

var PointButton = () => {
    gamedata.points = gamedata.points.plus(1);
    updateneeds.push("points");
    if (gamedata.unlock_bought.includes("boost"))
        gamedata.currentboost = gamedata.currentboost.add(0.01);
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
Notify("alert", "You can [ right-click + drag ] to re-arragne all these boxes!<br><br>Have fun playing!");
NavVisible(false);

// this is the global loop
setInterval(function () {

    var delay = GetTime();
    SetTime();

    gamedata.points = gamedata.points.plus(BuildStep(delay));
    updateneeds.push("points")
    MetagenStep(delay);
    ValidateMetagen(true, delay);

    if (!gamedata.stagekeys.includes("p10") && gamedata.points >= 10) {
        gamedata.stagekeys.push("p10");

        CreateBuildings();

        CreateBuild(1);
        updateneeds.push("buildbuy");
        CreateBuild(gamedata.buildcount.length);

        CreatePPS();

        CreateNewsfeed();
        RefreshNewsfeed();

        ChangeTitle("A Game about Getting Points");
        Navbar("stage0");

        if (loadgamepoints < 10)
            Notify("alert", "Congrats on your first 10 points...<br><br>Now, your first goal should be to get some sort of automatic point production set up.<br>Namely, in the form of a building.<br><br>You can see in the the building module, there is a button to buy B-1, or building one, for 100 points. (in engineer notation)<br><br>Those other numbers to the right of the building won't make sense yet, but should soon become obvious.");
    }
    if (gamedata.stagekeys.includes("p10")) {
        if (gamedata.points.compare(gamedata.buildcostbase[gamedata.buildcostbase.length-1]*2) >= 0) {
            CreateBuild(gamedata.buildcount.length+1);
            updateneeds.push("buildbuy");

            Notify("alert2", "New Building Unlocked!");
        }
    }

    if (gamedata.unlock_bought.includes("boost")) {
        gamedata.boosttime = gamedata.boosttime.plus(delay/1000);
    }
    if (gamedata.boosttime.compare(gamedata.boosttimemax) >= 0  && gamedata.unlock_bought.includes("unboost"))
            gamedata.boosttimemax = gamedata.boosttime;
    if (gamedata.unlock_bought.includes("metagen"))
        gamedata.focus = new Decimal(document.getElementById("focusslider").value);

    CheckUnlockVisable();

    ValidateBoost();

    Update();

}, deltams);

setInterval(function () {
    if (gamedata.stagekeys.includes("p10")) {
        SaveGamedata();
        RefreshNewsfeed();
    }
}, 15000);

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
    if (gamedata.points.compare(gamedata.buildcost[x].plus(-1)) == 1) {
        gamedata.points = gamedata.points.sub(gamedata.buildcost[x]);

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
            var addition = new Decimal(15+(2*i)).pow(i).times(deltams/1000).times(gamedata.buildcount[i]);
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
            if (gamedata.boosttime.compare(ul.timereq) < 0)
                visible = false;
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
            ChangeTitle("A Game about Getting Points using Boost");
            if (!gamedata.unlock_bought.includes(id))
            Notify("alert2", "Boosting system aquired!<br><br>To use the system, simply press the point button repeatedly in quick succcession.<br><br>You can monitor your boost stats in the boost module.<br>All production is multiplied by the total boost.");
            break;
        case "metagen":
            CreateMetaSlider();
            ChangeTitle("A Game about Getting B-1");
            if (!gamedata.unlock_bought.includes(id))
            Notify("alert2", "You can now channel your focus!<br><br>To use the system, just move the slider labeled focus to focus on what you want to.<br><br>Low focus levels will lower your point prouction drastically, but your building will also produce buildings of the tiers below them. For example, B-3 buildings will make some amount of B-2 buildings per second. These amounts are not listed.<br><br>However! this comes with a downside as well. If your focus is too much toward one side, your drift will increase. At maximum drift, your focus will lapse and all production will stop.");
            break;
        case "unboost":
            CreateUnboost();
            ChangeTitle("A Game about the Mysterious Boost Thing");
            if (!gamedata.unlock_bought.includes(id))
            Notify("alert2", "The mysterious energy has merged with your button!<br><br>To use the system, simply increase your unboosted time. The maximum amount that you have ever gotten in unboosted time is saved, and you get a multiplier based on that.");
            break;
        case "boostdelay":
            ChangeTitle("A Game about Getting Points using Boost... again");
            if (!gamedata.unlock_bought.includes(id))
            Notify("alert2", "The glue machine has been set up!<br>It's sticky, though.<br><br>It provides +"+(gamedata.boostmult-1)+" seconds to delay at time of purchase, which will increase with the maximum boost.");
            break;
    }
}

function GetBoost () {
    var boostmult = new Decimal(1);

    boostmult = boostmult.times(gamedata.currentboost.add(1));

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
    if (gamedata.boosttime.compare(delay) > 0) {
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
            gamedata.buildcount[i-1] = gamedata.buildcount[i-1].plus(gamedata.buildcount[i].times(new Decimal(1).minus(gamedata.focus).times(0.01)));
        }
    }
}

function ValidateMetagen (change, deltams) {
    var mult = new Decimal(1);
    if (gamedata.focus.plus(-0.5).sign != gamedata.focusamount.sign) {
        mult = mult.times(20);
    }

    if (change) {
        gamedata.focusamount = gamedata.focusamount.plus(gamedata.focus.minus(0.5).times(mult).times(deltams.div(1000)));
        if (gamedata.focusamount.compare(gamedata.focuslimit) >= 0)
            gamedata.focusamount = gamedata.focuslimit;
    }

    if (gamedata.focus.abs().compare(gamedata.focuslimit) <= 0)
        return true;
    else
        return false;
}