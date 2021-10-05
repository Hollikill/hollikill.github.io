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

    focus: new Decimal(1),  

    stagekeys: [],

    buildcost: [],
    buildcostbase: [],
    buildcount: [],
    buildbought: [],

    unlock_viewable: [],
    unlock_bought: [],

    lasttime: 0,

    version: "5t.4",
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
            if (localStorage.getItem("savecodejson"))
                Notify("warn", "If you play here you will override a save with "+JSON.parse(localStorage.getItem("savecodejson")).points+" points.<br>Reload the page to load the saved game.");
            break;
    }

    var savecode = JSON.parse(savecodejson);

    gamedata.points = new Decimal(savecode.points);
    loadgamepoints = new Decimal(savecode.points);

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
    ChangeTitle("A Game about Getting a Lot of Points");

    audio.play();

    CreateAudioSettings();
    Navbar(curtab);
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
    MetagenStep();

    if (!gamedata.stagekeys.includes("p10") && gamedata.points >= 10) {
        gamedata.stagekeys.push("p10");

        CreateBuildings();

        CreateBuild(1);
        updateneeds.push("buildbuy");
        CreateBuild(gamedata.buildcount.length);

        CreatePPS();

        CreateNewsfeed();
        RefreshNewsfeed();

        Navbar("stage0");

        if (loadgamepoints < 10)
            Notify("alert", "Congrats on your first 10 points...<br><br>Now, your first goal should be to get some sort of automatic point production set up.<br>Namely, in the form of a building.<br><br>You can see in the the building module, there is a button to buy B-1, or building one, for 100 points. (in engineer notation)");
    }
    if (gamedata.stagekeys.includes("p10")) {
        if (gamedata.points.compare(gamedata.buildcost[gamedata.buildcost.length-1]*2) >= 0) {
            CreateBuild(gamedata.buildcount.length+1);
            updateneeds.push("buildbuy");

            Notify("alert2", "New Building Unlocked!");
        }
    }

    if (gamedata.unlock_bought.includes("boost"))
        gamedata.boosttime = gamedata.boosttime.plus(delay/1000);
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
            buildcount.id = "buildcount"+curbuildcount;
            buildbought.id = "buildbought"+curbuildcount;
            seperator.textContent = " ";
            seperator.append(buildbought);
            seperator.innerHTML = seperator.innerHTML + " (+";
            seperator.append(buildcount);
            seperator.innerHTML = seperator.innerHTML + ")";

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
            var addition = new Decimal(15+(2*i)).pow(i).times(deltams/1000).times(gamedata.buildcount[i])
            if (gamedata.unlock_bought.includes("metagen")) {
                addition = addition.times(gamedata.focus.pow(i+1));
            }
            total = total.plus(addition);
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
            }
        }

        if (canbuy) {
            TriggerUnlock(ul.id);
            gamedata.unlock_bought.push(ul.id);
            e.textContent = "Bought";
            e.setAttribute("onclick", "");
        }
    }
}

function TriggerUnlock (id) {
    switch (id) {
        case "boost":
            CreateBoost();
            if (!gamedata.unlock_bought.includes(id))
            Notify("alert2", "Boosting system aquired!<br><br>To use the system, simply press the point button repeatedly in quick succcession.<br><br>You can monitor your boost stats in the boost module.<br>All production is multiplied by the total boost.");
            break;
        case "metagen":
            CreateMetaSlider();
            if (!gamedata.unlock_bought.includes(id))
            Notify("alert2", "You can now channel your focus!<br><br>To use the system, just move the slider labeled focus to focus on what you want to.<br><br>Low focus levels will lower your point prouction drastically, but your building will also produce buildings of the tiers below them. For example, B-3 buildings will make some amount of B-2 buildings per second. These amounts are not listed.");
            break;
    }
}

function GetBoost () {
    var boostmult = new Decimal(1);

    boostmult = boostmult.times(gamedata.currentboost.add(1));

    return new Decimal(boostmult);
}

function ValidateBoost () {
    if (gamedata.currentboost.compare(gamedata.maxboost) > 0) {
        gamedata.maxboost = gamedata.maxboost.add(0.001);
        gamedata.currentboost = gamedata.maxboost;
    }

    if (gamedata.boosttime > 1) {
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

function MetagenStep () {
    for (var i = 1; i < gamedata.buildcount.length; i++) {
        if (gamedata.buildcount[i].compare(0) > -1) {
            gamedata.buildcount[i-1] = gamedata.buildcount[i-1].plus(gamedata.buildcount[i].times(new Decimal(1).minus(gamedata.focus).times(0.01)));
        }
    }
}