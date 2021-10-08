var HideElementID = (id) => {
    document.getElementById(id).style.display = "none";
}

var CheckTab = (tabid) => {
    var tabexists = false;
    for (var v of document.getElementById("navbar").children) {
        if (v.id == tabid) tabexists = true;
    }

    if (!tabexists) {
        var newtab = document.createElement("button");
        newtab.id = tabid;
        newtab.innerHTML = tabid;
        newtab.setAttribute("onclick", "Navbar('"+tabid+"')");

        document.getElementById("navbar").appendChild(newtab);
    }
}

var AddModule = (tabid) => {
    CheckTab(tabid);

    var container = document.createElement("div");
    container.classList.add(tabid);
    container.classList.add("module");
    container.setAttribute("oncontextmenu", "return false;");
    document.getElementById("navcontent").appendChild(container);

    container.style.top = (Math.random()*45+20)+"%";
    container.style.left = (Math.random()*45+20)+"%";

    dragElement(container, 0);

    return container;
}

var Update = () => {
    if (updateneeds.includes("points")) {
        ChangeNumber("pointcount", gamedata.points);
    }
    if (gamedata.unlock_bought.includes("boost")) {
        ChangeNumber("currentboost", gamedata.currentboost.add(1), 2);
        ChangeNumber("maxboost", gamedata.maxboost.add(1), 2);
        ChangeNumber("boosttime", gamedata.boosttime);
        ChangeNumber("totalboost", new Decimal(GetBoost()), 2);
    }
    if (gamedata.unlock_bought.includes("metagen")) {
        ChangeNumber("focus", gamedata.focus, 2);
        ChangeNumber("focusamount", gamedata.focusamount, 2);
    }
    if (gamedata.unlock_bought.includes("unboost")) {
        ChangeNumber("boosttimeval", GetBoosttimeMult(), 2);
    }
    if (gamedata.unlock_bought.includes("statis")) {
        ChangeNumber("statisx", gamedata.statisaverage.x, 2);
        ChangeNumber("statisy", gamedata.statisaverage.y, 2);
        ChangeNumber("statisdrift", gamedata.statisaverage.driftx.abs().plus(gamedata.statisaverage.drifty.abs()), 2);
        ChangeNumber("statiscount", new Decimal(gamedata.statispoints.length));
        ChangeNumber("statisval", GetStatisFactor(), 2);
        ChangeNumber("statiscost", gamedata.statiscostbase.times(gamedata.statiscostincreasefactor.pow(gamedata.statispoints.length+1)));
    }

    if (gamedata.stagekeys.includes("p10")) {
        ChangeNumber("statpps", BuildStep(1000));

        var totalbought = new Decimal(0);
        for (var i = 0; i < gamedata.buildcount.length; i++) {
            ChangeNumber("buildcost"+i, gamedata.buildcost[i]);
            totalbought = totalbought.plus(gamedata.buildbought[i]);
            ChangeNumber("buildcount"+i, gamedata.buildcount[i].floor().minus(gamedata.buildbought[i]));    
            ChangeNumber("buildbought"+i, gamedata.buildbought[i]);
            ChangeNumber("buildrate"+i, new Decimal(15+(2*i)).pow(i).times(gamedata.buildcount[i].floor()).times(GetBoost()));
        }
        ChangeNumber("purchase", totalbought, 1);
    }

    updateneeds = [];
}

var NavVisible = (bool) => {
    var bar = document.getElementById("navbar");
    var content = document.getElementById("navcontent")
    var display = "none";

    if (bool)
        display = "flex";

    bar.style.display = display;
    content.style.display = display;
}

var Navbar = (tabid) => {
    curtab = tabid;
    for (var tab of document.getElementById("navcontent").children) {
        if (tab.classList.contains(tabid) || tab.classList.contains("priority")) {
            tab.style.display = "block";
        }
        else {
            tab.style.display = "none";
        }
    }
}

var ChangeTitle = (newtitle) => {
    document.getElementById("titletext").textContent = newtitle;
    gamedata.title = newtitle;
}

var CreatePointButton = () => {
    var container = AddModule("stage0");

    var pointcounttext = document.createElement("span");
    pointcounttext.id = "pointcounttext";
    pointcounttext.textContent = "Points: ";

    var pointcount = document.createElement("span");
    pointcount.id = "pointcount";

    var pointbutton = document.createElement("button");
    pointbutton.textContent = "Click me for points";
    pointbutton.addEventListener('click', PointButton);
    pointbutton.style.fontSize = "200%";

    container.appendChild(pointcounttext);
    container.appendChild(pointcount);
    container.appendChild(document.createElement("br"));
    container.appendChild(pointbutton);

    updateneeds.push("points");
}

var CreateBuildings = () => {
    var container = AddModule("stage0");

    var buildingholder = document.createElement("div");
    buildingholder.id = "buildbuyholder";
    
    container.appendChild(buildingholder);
}

function CreatePPS () {
    var container = AddModule("stage0");

    var instruct = document.createElement("span");
    instruct.textContent = "Points Per Second: +";

    var ppscount = document.createElement("span");
    ppscount.id = "statpps";

    var persecondtext = document.createElement("span");
    persecondtext.textContent = "/s";

    container.appendChild(instruct);
    container.appendChild(ppscount);
    container.appendChild(persecondtext);

    container.appendChild(document.createElement("br"));
    var purchasetext = document.createElement("span");
    purchasetext.id = "purchasetext";
    purchasetext.textContent = "Purchases: ";
    container.appendChild(purchasetext);
    var purchase = document.createElement("span");
    purchase.id = "purchase";
    container.appendChild(purchase);
}

function Notify (type, text) {
    var container = AddModule("priority");
    container.classList.add(type);

    var textelement = document.createElement("span");
    textelement.innerHTML = text;
    container.appendChild(textelement);
    container.appendChild(document.createElement("br"));
    container.appendChild(document.createElement("br"));

    var exitbutton = document.createElement("button");
    exitbutton.setAttribute("onclick", "CloseNotify(this)");
    exitbutton.textContent = "Close Notification"
    exitbutton.style.width = "100%";
    container.appendChild(exitbutton);
}

function CloseNotify (e) {
    e.parentElement.remove();
}

function CreateUnlock (id, name, description, cost, costtype) {
    var container = AddModule("stage0");
    container.id = "ul"+id;

    var buybutton = document.createElement("button");
    buybutton.setAttribute("onclick", "BuyUnlock('"+id+"', this)");
    buybutton.textContent = "Buy ("+cost.mantissa.toFixed(2)+"e"+cost.exponent+" "+costtype+")";

    var unlockname = document.createElement("span");
    unlockname.style.fontWeight = "bold";
    unlockname.textContent = name+" ";

    var descriptiontext = document.createElement("span");
    descriptiontext.innerHTML = description;

    container.appendChild(unlockname);
    container.appendChild(buybutton);
    container.appendChild(document.createElement("br"));
    container.appendChild(descriptiontext);
}

function CreateAudioSettings () {
    var container = AddModule("settings")

    var togglebutton = document.createElement("button");
    var volumebutton = document.createElement("button");
    var volumeval = document.createElement("span");
    volumeval.id = "volumeval";

    togglebutton.textContent = "Toggle Background Music";
    volumebutton.textContent = "Adjust Music Volume";

    togglebutton.setAttribute("onclick", "ToggleAudio()");
    volumebutton.addEventListener("click", function () {
        AdjustMusic();
        ChangeNumber("volumeval", new Decimal(audio.volume), 2);
    }, false);

    container.appendChild(togglebutton);
    container.appendChild(document.createElement("br"));
    container.appendChild(volumebutton);
    container.appendChild(volumeval);

    ChangeNumber("volumeval", new Decimal(0.2), 2);
}

function CreateUnlockSettings () {
    var container = AddModule("settings")

    var toggleoldbutton = document.createElement("button");

    toggleoldbutton.textContent = "Toggle Old Researches";
    
    toggleoldbutton.addEventListener("click", function () {
        if (gamedata.unlocksetting){
            gamedata.unlocksetting = false;
            alert('old unlocks hidden');
        }
        else{
            gamedata.unlocksetting = true;
            alert('old unlocks revealed');
        }
        
        var style;
        if (gamedata.unlocksetting)
            style = "visible";
        else
            style = "hidden";

        var ullist = document.getElementsByClassName("ul");
        for (var ul of ullist) {
            ul.style.visibility = style;
        }
    }, false);

    container.appendChild(toggleoldbutton);
}

function CreateNewsfeed() {
    var container = AddModule("stage0");
    container.style.width = "40em";

    var titletext = document.createElement("span");
    titletext.style.fontWeight = "bold";
    titletext.textContent = "The Newsfeed"

    var newstext = document.createElement("span");
    newstext.id = "newstext";

    container.appendChild(titletext);
    container.appendChild(document.createElement("br"));
    container.appendChild(newstext);
}

function RefreshNewsfeed() {
    var applicable = [];
    for (var line of newslines) {
        switch (line.type) {
            case "all":
                applicable.push(line.text);
                break;
            case "point":
                if (gamedata.points.compare(line.min) >= 0 && gamedata.points.compare(line.max) <= 0)
                    applicable.push(line.text);
                break;
        }
    }

    document.getElementById("newstext").innerHTML = applicable[Math.floor(applicable.length*Math.random())];
}

function CreateBoost() {
    var container = AddModule("stage0");

    var boosttext = document.createElement("span");
    var boostval = document.createElement("span");
    var boostmaxval = document.createElement("span");
    var boosttimetext = document.createElement("span");
    var boosttimeval = document.createElement("span");
    var boosttotaltext = document.createElement("span");
    var boosttotalval = document.createElement("span");

    boostval.id = "currentboost";
    boostmaxval.id = "maxboost";
    boosttimeval.id = "boosttime";
    boosttotalval.id = "totalboost";

    boosttext.textContent = "Boost: ["
    boosttext.append(boostval);
    boosttext.innerHTML = boosttext.innerHTML + "/";
    boosttext.append(boostmaxval);
    boosttext.innerHTML = boosttext.innerHTML + "]x";

    boosttimetext.textContent = "Unboosted Time: ";
    boosttimetext.append(boosttimeval);
    boosttimetext.id = "boosttimetext";
    boosttimetext.innerHTML = boosttimetext.innerHTML + "s";

    boosttotaltext.textContent = "Total Boost: [";
    boosttotaltext.append(boosttotalval);
    boosttotaltext.innerHTML = boosttotaltext.innerHTML + "]x";

    container.append(boosttext);
    container.append(document.createElement("br"));
    container.append(boosttimetext);
    container.append(document.createElement("br"));
    container.append(boosttotaltext);
}

function CreateMetaSlider () {
    var container = AddModule("stage0");

    var focusslider = document.createElement("input");
    focusslider.setAttribute("type", "range");
    focusslider.setAttribute("min", "0.01");
    focusslider.setAttribute("max", "1");
    focusslider.setAttribute("step", "0.01");
    focusslider.setAttribute("value", gamedata.focus);
    focusslider.id = "focusslider"

    var focustext = document.createElement("span");
    focustext.textContent = "Focus: ";
    var focusval = document.createElement("span");
    focusval.id = "focus";
    focustext.appendChild(focusval);

    focustext.innerHTML = focustext.innerHTML + " at [";
    var focusamount = document.createElement("span");
    focusamount.id = "focusamount";
    focustext.appendChild(focusamount);
    focustext.innerHTML = focustext.innerHTML + "] drift";

    container.append(focusslider);
    container.append(document.createElement("br"));
    container.append(focustext);
}

function CreateUnboost () {
    if (document.getElementById("boosttimetext")) {
        var boosttimeval = document.createElement("span");
        var boosttimetext = document.getElementById("boosttimetext");
        boosttimeval.id = "boosttimeval";

        boosttimetext.innerHTML = boosttimetext.innerHTML + " [";
        boosttimetext.appendChild(boosttimeval);
        boosttimetext.innerHTML = boosttimetext.innerHTML + "x]";
    }    
}

function CreateStatis () {
    var container = AddModule("stage0");

    var flex = document.createElement("div");
    flex.style.display = "flex";

    var statismap = document.createElement("div");
    statismap.id = "statismap";
    flex.append(statismap);
    statismap.style.backgroundColor = "gray";
    statismap.style.width = "15em";
    statismap.style.height = "15em";
    statismap.style.margin = "0.5em";

    var vline = document.createElement("div");
    var hline = document.createElement("div");

    vline.style.height = "15em";
    vline.style.width = "2px";
    vline.style.position = "absolute";
    vline.style.left = "8em";
    vline.style.backgroundColor = "black";

    hline.style.height = "2px";
    hline.style.width = "15em";
    hline.style.position = "absolute";
    hline.style.top = "8em";
    hline.style.backgroundColor = "black";

    statismap.append(vline);
    statismap.append(hline);

    var rightsection = document.createElement("div");
    flex.append(rightsection);
    rightsection.style.width = "14em";

    var statistext = document.createElement("span");
    var statisx = document.createElement("span");
    var statisy = document.createElement("span");
    var statisdrift = document.createElement("span");
    var statiscount = document.createElement("span");
    var statisval = document.createElement("span");
    statisx.id = "statisx";
    statisy.id = "statisy";
    statisdrift.id = "statisdrift";
    statiscount.id = "statiscount";
    statisval.id = "statisval";

    statistext.innerHTML = statistext.innerHTML + "Average sHorz: ";
    statistext.append(statisx);
    statistext.innerHTML = statistext.innerHTML + "<br>Average sVort: ";
    statistext.append(statisy);
    statistext.innerHTML = statistext.innerHTML + "<br>Average Drift: ";
    statistext.append(statisdrift);
    statistext.innerHTML = statistext.innerHTML + "<br><br>StatiConfluxi: ";
    statistext.append(statiscount);
    statistext.innerHTML = statistext.innerHTML + "<br><br>Statis Factor: ";
    statistext.append(statisval);

    rightsection.append(statistext);

    var buybutton = document.createElement("button");
    buybutton.innerHTML = "Buy StatiConflux (";
    var statiscost = document.createElement("span");
    statiscost.id = "statiscost";
    buybutton.append(statiscost);
    buybutton.innerHTML = buybutton.innerHTML + ")";
    buybutton.setAttribute("onclick", "BuyStatis()");

    rightsection.append(document.createElement("br"));
    rightsection.append(document.createElement("br"));
    rightsection.append(buybutton);

    container.append(flex);
}

function HideClasses (classes, hidden) {
    for (var c of classes) {
        var divs = document.getElementsByClassName(c);

        for (var d of divs) {
            if (hidden) {
                d.style.visibility = "hidden";
            }
            else {
                d.style.visibility = "visible";
            }
        }
    }
}

function CreateNotifyToggles () {
    var container = AddModule("settings");
    container.classList.add("priority");

    var buttonon = document.createElement("button");
    var buttonoff = document.createElement("button");

    buttonon.textContent = "View Notifications";
    buttonoff.textContent = "Hide Notifications";

    buttonon.addEventListener("click", function () {
        HideClasses(["alert"], false);
        HideClasses(["warn"], false);
        HideClasses(["alert2"], false);
    });
    buttonoff.addEventListener("click", function () {
        HideClasses(["alert"], true);
        HideClasses(["warn"], true);
        HideClasses(["alert2"], true);
    });

    container.append(buttonoff);
    container.append(buttonon);

    container.style.position = "absolute";
    container.style.top = "10px";
    container.style.left = "10px";
}

function DisplaySavecode (ms) {
    var text = document.getElementById("lasttime");
    text.innerHTML = "<br>Detected a save from ";

    var d = new Date();
    var n = new Decimal(d.getTime());
    var diff = n.plus(ms.neg());

    text.innerHTML = text.innerHTML + diff.plus(diff.div(1000*60).floor().times(1000*60).neg()).div(1000).floor();
    text.innerHTML = text.innerHTML + "s ";
    text.innerHTML = text.innerHTML + diff.plus(diff.div(1000*60*60).floor().times(1000*60*60).neg()).div(1000*60).floor();
    text.innerHTML = text.innerHTML + "m ";
    text.innerHTML = text.innerHTML + diff.plus(diff.div(1000*60*60*24).floor().times(1000*60*60*24).neg()).div(1000*60*60).floor();
    text.innerHTML = text.innerHTML + "h ";
    text.innerHTML = text.innerHTML + diff.div(1000*60*60*24).floor();
    text.innerHTML = text.innerHTML + "d ago";
}