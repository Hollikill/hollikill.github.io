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
        ChangeNumber("purchase", totalbought);
    }

    if (gamedata.unlockkeys.includes("p10"))
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
    var container = AddModule("priority");

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
    var container = AddModule("clicktab");

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
    var container = AddModule("clicktab");

    var instruct = document.createElement("span");
    instruct.textContent = "Points Per Second: ";

    var ppscount = document.createElement("span");
    ppscount.id = "statpps";

    container.appendChild(instruct);
    container.appendChild(ppscount);
}

function Notify (text) {
    var container = AddModule("priority");

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