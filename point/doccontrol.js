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
    document.getElementById("navcontent").appendChild(container);

    dragElement(container);

    container.style.top = (Math.random()*45+20)+"%";
    container.style.left = (Math.random()*45+20)+"%";

    return container;
}

var Update = () => {
    if (updateneeds.includes("points")) {
        ChangeNumber("pointcount", gamedata.points);
    }
    if (updateneeds.includes("buildbuy")) {
        var totalbought = new Decimal(0);
        for (var i = 0; i < gamedata.buildcount.length; i++) {
            ChangeNumber("buildcost"+i, gamedata.buildcost[i]);
            totalbought = totalbought.plus(gamedata.buildbought[i]);
        }
        ChangeNumber("purchase", totalbought, 1);
    }

    if (gamedata.stagekeys.includes("p10"))
        ChangeNumber("statpps", BuildStep(1000));

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

    container.appendChild(pointcounttext);
    container.appendChild(pointcount);
    container.appendChild(document.createElement("br"));
    container.appendChild(pointbutton);

    updateneeds.push("points");
}

var CreateBuildings = () => {
    var container = AddModule("stage0");

    var purchasetext = document.createElement("span");
    purchasetext.id = "purchasetext";
    purchasetext.textContent = "Purchases: ";

    var purchase = document.createElement("span");
    purchase.id = "purchase";

    var buildingholder = document.createElement("div");
    buildingholder.id = "buildbuyholder";
    
    container.appendChild(purchasetext);
    container.appendChild(purchase);
    container.appendChild(document.createElement("br"));
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

    var buybutton = document.createElement("button");
    buybutton.setAttribute("onclick", "BuyUnlock('"+id+"', this)");
    buybutton.textContent = "Buy ("+cost.toString()+" "+costtype+")";

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

    togglebutton.textContent = "Toggle Background Music";
    volumebutton.textContent = "Adjust Music Volume";

    togglebutton.setAttribute("onclick", "ToggleAudio()");
    volumebutton.setAttribute("onclick", "AdjustMusic()");

    container.appendChild(togglebutton);
    container.appendChild(document.createElement("br"));
    container.appendChild(volumebutton);
}

function CreateNewsfeed() {
    var container = AddModule("stage0");

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