var money = 100;
var lastflip = 0;
var netgain = 0;
var stocks = [];

var StartGame = function () {
    var delme = document.getElementById("delete_me");
    delme.remove();
    
    var stat_box = document.getElementById("stat_box");
    stat_box.classList.add("stat_box");

    AddCounter();
    AddChance();
    AddPreviousFlipCounter();
    AddTotalCounter();
    AddStocks();

    dragElement(stat_box, 0);
    dragElement(document.getElementById("c_hold"), 0);

    setInterval(() => {
        UpdateStocks();
        UpdateMoney();
    }, 1000);
}

var AddCounter = function () {
    if (!document.getElementById("m_count")) {
        var m_hold = document.createElement("p");
        m_hold.textContent = "$ ";
        var m_count = document.createElement("span");
        m_count.id = "m_count";
        m_count.textContent = "100";
        m_hold.append(m_count);
        document.getElementById("stat_box").append(m_hold);
    }
}

var AddPreviousFlipCounter = function () {
    var m_hold = document.createElement("p");
    m_hold.id = "last_flip_hold";
    m_hold.textContent = "+(";
    var m_count = document.createElement("span");
    m_count.id = "last_flip";
    m_count.textContent = "0";
    m_hold.append(m_count);
    m_hold.innerHTML = m_hold.innerHTML + ")";
    document.getElementById("stat_box").append(m_hold);
}

var AddTotalCounter = function () {
    var m_hold = document.createElement("p");
    m_hold.id = "tot_flip_hold";
    m_hold.textContent = "money lost: ";
    var m_count = document.createElement("span");
    m_count.id = "tot_flip";
    m_count.textContent = "0";
    m_hold.append(m_count);
    m_hold.innerHTML = m_hold.innerHTML + "";
    document.getElementById("stat_box").append(m_hold);
}

var AddChance = function () {
    var c_hold = document.createElement("div");
    c_hold.classList.add("c_hold");
    c_hold.id = "c_hold";

    var c_flip = document.createElement("button");
    c_flip.textContent = "Flip a Coin ($1)";
    c_flip.classList.add("c_flip");
    c_flip.addEventListener('click', () => {DoFlip(1)});

    c_hold.append(c_flip);

    document.getElementById("main").append(c_hold);
}

var DoFlip = function (x) {
    var net_m = 0;
    if (Math.random()*3 >= 1) {
        net_m = net_m + 2*x;
    }
    net_m = net_m - 1*(x);
    lastflip = net_m;
    money = money + net_m;
    UpdateMoney();
}

var UpdateMoney = function () {
    if (money <= 0) {
        money = -1e400;
        document.getElementById("tot_flip_hold").innerHTML = "Totally in debt."
    }
    else {
        if (lastflip != 0) {
            document.getElementById("last_flip").textContent = lastflip.toFixed(0);
            if (lastflip < 0) {
                document.getElementById("last_flip_hold").style.color = "red";
            }
            else {
                document.getElementById("last_flip_hold").style.color = "lime";
            }
        }

        if (lastflip < 0) {
            netgain += lastflip;
            lastflip = 0;
        }
        document.getElementById("tot_flip").textContent = (netgain*(-1)).toFixed(0);
    }

    document.getElementById("m_count").textContent = money.toFixed(0);
}

var AddStocks = function () {
    var container = document.createElement("div");
    container.id = "stk_hold";
    document.getElementById("main").append(container);
    dragElement(container, 0)

    for (var i = 0; i<5; i++) {
        var newstock = {
            drift: 0,
            value: 100,
            owned: 0,
        }
        stocks.push(newstock);

        var stk_hold = document.createElement("p");
        stk_hold.id = i+"hold";
        var stk_c_value = document.createElement("span");
        stk_c_value.id = i+"value";
        var stk_c_owned = document.createElement("span");
        stk_c_owned.id = i+"owned";
        var stk_buy = document.createElement("button");
        stk_buy.setAttribute("onclick", "AttemptStockExchange(1, "+i+")");
        stk_buy.textContent = "Buy 1";
        var stk_sell = document.createElement("button");
        stk_sell.setAttribute("onclick", "AttemptStockExchange(-1, "+i+")");
        stk_sell.textContent = "Sell 1";

        stk_hold.innerHTML = "Stock #"+i+" worth $"
        stk_hold.append(stk_c_value);
        stk_hold.append(document.createElement("br"));
        stk_hold.innerHTML = stk_hold.innerHTML + "owned: ";
        stk_hold.append(stk_c_owned);
        stk_hold.append(document.createElement("br"));
        stk_hold.append(stk_buy);
        stk_hold.append(stk_sell);

        container.append(stk_hold);
    }
}

var AttemptStockExchange = function (x, i) {
    if (x < 0) {
        var tosell = 0
        if (stocks[i].owned >= -1*x) {
            tosell = -1*x;
        }
        else {
            tosell = stocks[i].owned;
        }

        money += tosell*(stocks[i].value);
        stocks[i].owned = stocks[i].owned - tosell;
    }
    else if (money >= x*(stocks[i].value)) {
        money = money - x*(stocks[i].value);
        stocks[i].owned += x;
    }

    UpdateMoney();
}

var UpdateStocks = function () {
    //#Source https://bit.ly/2neWfJ2 
    const clampNumber = (num, a, b) => Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));

    for (var i = 0; i < stocks.length; i++) {
        stocks[i].drift = stocks[i].drift + ((Math.random()*2)-1)/2;
        stocks[i].drift = clampNumber(stocks[i].drift, -1, 1)
        stocks[i].value = stocks[i].value + 10*stocks[i].drift;
        if (stocks[i].value < 15) {
            stocks[i].value = 15;
        }

        document.getElementById(i+"value").textContent = stocks[i].value.toFixed(2);
        document.getElementById(i+"owned").textContent = stocks[i].owned.toFixed(0);
    }
}