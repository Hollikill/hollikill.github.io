var deltams = 100;

var updateneeds = [];

// object for storing savegame-relavent values
var gamedata = {
    points: new Decimal(0),
    unlockkeys: [],
    buildcost: [],
    buildcostbase: [],
    buildcount: [],
    buildbought: [],
    version: "5t.1",
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
            SaveGamedata();
            LoadGamedata(1);
            return;
            break;
    }

    var savecode = JSON.parse(savecodejson);

    gamedata.points = new Decimal(savecode.points);

    for (var i = 0; i < savecode.buildcost.length; i++) {
        gamedata.buildcost.push(new Decimal(savecode.buildcost[i]));
        gamedata.buildcostbase.push(new Decimal(savecode.buildcostbase[i]));
        gamedata.buildcount.push(new Decimal(savecode.buildcount[i]));
        gamedata.buildbought.push(new Decimal(savecode.buildbought[i]));
    }

    HideElementID("startmenu");
    NavVisible(true);
    ChangeTitle("A Game about Getting a Lot of Points");
    Notify("You can [ click + drag ] to re-arragne all these boxes!<br>Now, go make the UI feel yours.<br><br>This game saves autoamtically, but it WILL wipe save data<br>when you click 'start anew', so be cautious.<br><br>Have fun playing!");
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

        CreateBuild(1);
        updateneeds.push("buildbuy");
        CreateBuild(gamedata.buildcount.length);

        CreatePPS();

        Navbar("clicktab");
    }
    if (gamedata.unlockkeys.includes("p10")) {
        if (gamedata.points.compare(gamedata.buildcost[gamedata.buildcost.length-1]*2) >= 0) {
            CreateBuild(gamedata.buildcount.length+1);
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


var CreateBuild = (x) => {
    for (var i = 0; i < x; i++) {
        var curbuildcount = gamedata.buildcount.length;
        if (i == gamedata.buildcount.length) {
            gamedata.buildcount.push(new Decimal(0));
            gamedata.buildbought.push(new Decimal(0));
            var cost = new Decimal(100).times(new Decimal(15+(curbuildcount*2)).pow(curbuildcount));
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

            document.getElementById("buildbuyholder").prepend(document.createElement("br"));
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
            total = total.plus(new Decimal(15+(2*i)).pow(i).times(deltams/1000).times(gamedata.buildcount[i]));
        }
    }

    return total;
}