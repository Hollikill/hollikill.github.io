var deltams = 100;

var updateneeds = [];

// object for storing savegame-relavent values
var gamedata = {
    points: new Decimal(0),
    unlockkeys: [],
}

var buildcost = [];
var buildcostbase = [];
var buildcount = [];
var buildbought = [];

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
            SaveGamedata();
            LoadGamedata(1);
            return;
            break;
    }

    var savecode = JSON.parse(savecodejson);

    gamedata.points = new Decimal(savecode.points);

    HideElementID("startmenu");
    NavVisible(true);
    ChangeTitle("A Game about Getting a Lot of Points");
}
var SaveGamedata = () => {
    localStorage.setItem("savecodejson", JSON.stringify(gamedata));
    navigator.clipboard.writeText(JSON.stringify(gamedata));
}

var PointButton = () => {
    gamedata.points = gamedata.points.plus(1);
    updateneeds.push("points");
}

// this holds everything but functions and global variables
$.getScript("drag.js", function() {
$.getScript("doccontrol.js", function() {
$.getScript("format.js", function() {
$(function() {

CreatePointButton();
NavVisible(false);

// this is the global loop
setInterval(function () {

    gamedata.points = gamedata.points.plus(BuildStep(deltams));
    updateneeds.push("points")

    if (!gamedata.unlockkeys.includes("p10") && gamedata.points >= 10) {
        gamedata.unlockkeys.push("p10");

        CreateBuildings();

        CreateBuild();
        updateneeds.push("buildbuy");

        CreatePPS();

        Navbar("clicktab");
    }
    if (gamedata.unlockkeys.includes("p10")) {
        if (gamedata.points >= buildcost[buildcost.length-1]*2) {
            CreateBuild();
            updateneeds.push("buildbuy");
        }
    }

    Update();

}, deltams);

setInterval(function () {
    if (gamedata.unlockkeys.includes("p10"))
        SaveGamedata();
}, 15000);

});
});
});
});


var CreateBuild = () => {
    var curbuildcount = buildcount.length;

    buildcount.push(new Decimal(0));
    buildbought.push(new Decimal(0));
    var cost = new Decimal(100).times(new Decimal(15+(curbuildcount*2)).pow(curbuildcount));
    buildcost.push(cost);
    buildcostbase.push(cost);

    var buybutton = document.createElement("button");
    buybutton.textContent = "B-"+(curbuildcount+1)+" [";
    var buildcosttext = document.createElement("span");
    buildcosttext.id = "buildcost"+curbuildcount;
    buybutton.appendChild(buildcosttext);
    buybutton.innerHTML = buybutton.innerHTML + "]";
    buybutton.setAttribute("onclick", "BuyBuild("+curbuildcount+")")

    document.getElementById("buildbuyholder").prepend(document.createElement("br"));
    document.getElementById("buildbuyholder").prepend(buybutton);
}

function BuyBuild(x) {
    if (gamedata.points.compare(buildcost[x].plus(-1)) == 1) {
        gamedata.points = gamedata.points.sub(buildcost[x]);

        buildbought[x] = buildbought[x].plus(1);
        buildcount[x] = buildcount[x].plus(1);
        buildcost[x] = new Decimal(buildcostbase[x]).times(new Decimal(1.01).pow(buildbought[x]));
    }
    updateneeds.push("buildbuy");
    updateneeds.push("points");
}

function BuildStep(deltams) {
    total = new Decimal(0);

    for (var i = 0; i < buildcount.length; i++) {
        if (buildcount[i].compare(0) > -1) {
            total = total.plus(new Decimal(15+(2*i)).pow(i).times(deltams/1000).times(buildcount[i]));
        }
    }

    return total;
}