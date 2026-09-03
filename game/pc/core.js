// variable declaration

// core loop control
const frames_per_second = 50; // number of ms per game tick
var last_frame_ms = Date.now(); // last computed frame in ms

// game loop control
const gain_base_time = 4; // base number of days per second
const gain_base_xp = 10; // base number of xp per day
var is_time_stepping = false; // is time proceeding

var dev_speed = 1; // speed multiplier for rapid iterative testing without disregarding normal path to get there

//////////////////
// jobs statistics
var jobs_data = {
    "beggar" : {
        xp : {
            scaling : [
                {type: "exp", degree:0.01},
                {type: "linear", degree:1},
            ],
            value : 50
        },
        earn : {
            scaling : [
                {type: "log", degree:10},
            ],
            value : 5
        },
    },
    "farmer" : {
        xp : {
            scaling : [
                {type: "exp", degree:0.01},
                {type: "linear", degree:1},
            ],
            value : 100
        },
        earn : {
            scaling : [
                {type: "log", degree:10},
            ],
            value : 9
        },
        requirements : [
            {type: "job", name:"beggar", level:10},
        ],
    },
    "fisher" : {
        xp : {
            scaling : [
                {type: "exp", degree:0.01},
                {type: "linear", degree:1},
            ],
            value : 200
        },
        earn : {
            scaling : [
                {type: "log", degree:10},
            ],
            value : 15
        },
        requirements : [
            {type: "job", name:"farmer", level:10},
        ],
    },
    "miner" : {
        xp : {
            scaling : [
                {type: "exp", degree:0.01},
                {type: "linear", degree:1},
            ],
            value : 400
        },
        earn : {
            scaling : [
                {type: "log", degree:10},
            ],
            value : 40
        },
        requirements : [
            {type: "job", name:"fisher", level:10},
            {type: "skill", name:"strength", level:10},
        ],
    },
    "blacksmith" : {
        xp : {
            scaling : [
                {type: "exp", degree:0.01},
                {type: "linear", degree:1},
            ],
            value : 800
        },
        earn : {
            scaling : [
                {type: "log", degree:10},
            ],
            value : 80
        },
        requirements : [
            {type: "job", name:"miner", level:10},
            {type: "skill", name:"strength", level:30},
        ],
    },
    "merchant" : {
        xp : {
            scaling : [
                {type: "exp", degree:0.01},
                {type: "linear", degree:1},
            ],
            value : 1600
        },
        earn : {
            scaling : [
                {type: "log", degree:10},
            ],
            value : 150
        },
        requirements : [
            {type: "job", name:"blacksmith", level:10},
            {type: "skill", name:"bargaining", level:50},
        ],
    },
}

var currencies = [
    {
        symbol: 'c',
        color: "#a64",
        denomination: 1,
    },
    {
        symbol: 's',
        color: "#999",
        denomination: 3,
    },
    {
        symbol: 'g',
        color: "#c7bc1d",
        denomination: 5,
    },
    {
        symbol: 'p',
        color: "#7bc",
        denomination: 7,
    },
    {
        symbol: 'e',
        color: "#2c7",
        denomination: 9,
    },
    {
        symbol: 's',
        color: "#66f",
        denomination: 11,
    },
    {
        symbol: 'r',
        color: "#e33",
        denomination: 13,
    },
    {
        symbol: 'd',
        color: "#fff",
        denomination: 15,
    },
    {
        symbol: '🜂',
        color: "#ff0",
        denomination: 18,
    },
]

// player data
var playerdata = {
    jobs : {

    },
    active : {
        job : "none",
        skill : "none",
    },
    resources : {
        money : 0,
        time : 14*365,
    }
}

//////////////////
// User interaction functions

var SelectActiveJob = function(u_jobname) {
    if (jobs_data[u_jobname] && u_jobname != playerdata.active.job) {
        if (jobs_data[playerdata.active.job]) { removeClass(document.getElementById(playerdata.active.job+"_job_listing"), "active_job_listing"); } // remove old active job css class
        playerdata.active.job = u_jobname;
        addClass(document.getElementById(playerdata.active.job+"_job_listing"), "active_job_listing");
    }

}

var SelectMainContentTab = function(tabname) {
    main_content_tabs = document.getElementById("main_content").children
    for (let i in main_content_tabs) {
        if (isNaN(i)) {}
        else {
            if (main_content_tabs[i].id == tabname+"_holder") {
                main_content_tabs[i].style.visibility = "visible";
                main_content_tabs[i].style.display = "";
            }
            else {
                main_content_tabs[i].style.visibility = "hidden";
                main_content_tabs[i].style.display = "none";
            }
        }
    }
}

var ToggleTimeStepping = function() {
    is_time_stepping = !is_time_stepping;

    let pause_button = document.getElementById("toggle_time_button");
    if (is_time_stepping) {
        pause_button.textContent = "PAUSE";
    }
    else {
        pause_button.textContent = "PLAY";
    }
}

////////////////////////////
// core loop
var Gameloop = function() {
    let delta_ms = Date.now() - last_frame_ms;
    last_frame_ms = Date.now();

    if (is_time_stepping) TickDay(delta_ms);

    UpdateDisplay();
}

var Setup = function() {
    // setup each job
    let jobs_holder = document.getElementById("jobs_holder")
    for (let jobname in jobs_data) {
        let job = jobs_data[jobname];

        // HTML add to holder
        let job_listing = document.createElement("div"); jobs_holder.appendChild(job_listing); // create holding div
        job_listing.className = "job_listing";
        job_listing.id = jobname+"_job_listing";

        // HTML button features
        let listing_button = document.createElement("button"); job_listing.appendChild(listing_button); // create job selection button
        listing_button.onclick = function() { SelectActiveJob(jobname) };

        let listing_button_bar = document.createElement("progress"); listing_button.appendChild(listing_button_bar);
        listing_button_bar.max = job.xp.value; listing_button_bar.value = 0;
        let listing_button_text = document.createElement("span"); listing_button.appendChild(listing_button_text);
        listing_button_text.textContent = jobname.toUpperCase();
        let listing_button_border_div = document.createElement("div"); listing_button.appendChild(listing_button_border_div);

        // HTML info numbers
        //let listing_info = document.createElement("span"); job_listing.appendChild(listing_info);
        //listing_info.innerHTML = " <span id=\"" + jobname + "_level\">###</span> | XP: <span id=\"" + jobname + "_xp_left\">###</span> | Income: <span id=\"" + jobname + "_earn\">###</span>";
        
        let listing_info_level = document.createElement("span"); job_listing.appendChild(listing_info_level);
        listing_info_level.id = jobname + "_level"
        let listing_info_xp_day = document.createElement("span"); job_listing.appendChild(listing_info_xp_day);
        listing_info_xp_day.id = jobname + "_xp_day"
        let listing_info_xp_left = document.createElement("span"); job_listing.appendChild(listing_info_xp_left);
        listing_info_xp_left.id = jobname + "_xp_left"
        let listing_info_income = document.createElement("span"); job_listing.appendChild(listing_info_income);
        listing_info_income.id = jobname + "_earn"

        // HTML create requirements text
        if (job.requirements) {
            let listing_req_text = document.createElement("div"); jobs_holder.appendChild(listing_req_text);
            listing_req_text.style.visibility = "hidden";
            listing_req_text.style.display = "none";
            listing_req_text.className = "req_text"
            listing_req_text.id = jobname+"_req_text"
        }

        // add to playerdata
        playerdata.jobs[jobname] = {
            xp : job.xp.value,
            level : 0,
            earn : job.earn.value,
        }
    }

    // hook core loop to window
    setInterval(Gameloop, 1000/frames_per_second);

    // preform default UI actions
    SelectActiveJob("beggar");
    UpdateUI_Jobs(true);
    SelectMainContentTab("jobs");
    ToggleTimeStepping();
}

window.onload=Setup;

//////////////////
// Mechanical Functions

var TickDay = function(delta_ms) {
    let days_passed = (delta_ms/1000) * gain_base_time * dev_speed;
    if (days_passed == 0) return;

    // process job tick
    if (jobs_data[playerdata.active.job]) { // make sure job exists
        let job = jobs_data[playerdata.active.job]

        playerdata.resources.money += days_passed * playerdata.jobs[playerdata.active.job].earn // add income for day
        playerdata.jobs[playerdata.active.job].xp -= days_passed * gain_base_xp; // add xp for day

        // process any job level ups
        if (playerdata.jobs[playerdata.active.job].xp <= 0){
            playerdata.jobs[playerdata.active.job].level += 1
            playerdata.jobs[playerdata.active.job].xp = job.xp.value* Scaling(job.xp.scaling, playerdata.jobs[playerdata.active.job].level) + playerdata.jobs[playerdata.active.job].xp
            playerdata.jobs[playerdata.active.job].earn = job.earn.value* Scaling(job.earn.scaling, playerdata.jobs[playerdata.active.job].level);
        }
    }

    // update player age
    playerdata.resources.time += days_passed
}

//////////////////
// Display functions

var UpdateDisplay = function() {
    UpdateUI_PlayerInfo();
    UpdateUI_Jobs();
    UpdateUI_JobVisibility();
}

var UpdateUI_Jobs = function(flag_reloadall = false) {
    for (let jobname in jobs_data) {
        if (jobname == playerdata.active.job || flag_reloadall) {
            document.getElementById(jobname + "_level").innerHTML = playerdata.jobs[jobname].level;
            document.getElementById(jobname + "_xp_day").innerHTML = Places(gain_base_xp, 1);
            document.getElementById(jobname + "_xp_left").innerHTML = Math.trunc(playerdata.jobs[jobname].xp);
            document.getElementById(jobname + "_earn").innerHTML = Currency(playerdata.jobs[jobname].earn);

            // update progress bar
            let job_bar = document.getElementById(jobname+"_job_listing").getElementsByTagName("button")[0].getElementsByTagName("progress")[0]
            job_bar.max = jobs_data[jobname].xp.value* Scaling(jobs_data[jobname].xp.scaling, playerdata.jobs[jobname].level)
            job_bar.value = job_bar.max - playerdata.jobs[jobname].xp
        }
    }
}

var UpdateUI_JobVisibility = function() {
    for (let jobname in jobs_data) {
        if (jobs_data[jobname].requirements) {
            let visible = 2;
            let reqs = jobs_data[jobname].requirements;
            let req_texts = []

            for (let i in reqs) {
                switch(reqs[i].type) {
                    case "job":
                        if (playerdata.jobs[reqs[i].name].level == 0) visible = 0;
                        else if (playerdata.jobs[reqs[i].name].level < reqs[i].level) visible = 1;

                        req_texts.push(reqs[i].name.toUpperCase() + " " + playerdata.jobs[reqs[i].name].level + "/" + reqs[i].level);

                        break;
                    default:
                        console.log("ERROR: invalid job requirement type REQ."+reqs[i].type.toUpperCase());
                        break;
                }
            }

            if (visible == 1) {
                document.getElementById(jobname+"_req_text").style.visibility = "visible";
                document.getElementById(jobname+"_req_text").style.display = "";
                document.getElementById(jobname+"_req_text").textContent = "Required: "+ req_texts.join(", ")
            }
            else {
                document.getElementById(jobname+"_req_text").style.visibility = "hidden";
                document.getElementById(jobname+"_req_text").style.display = "none";
            }
            
            if (visible < 2) {
                document.getElementById(jobname+"_job_listing").style.visibility = "hidden";
                document.getElementById(jobname+"_job_listing").style.display = "none";
            }
            else {
                document.getElementById(jobname+"_job_listing").style.visibility = "visible";
                document.getElementById(jobname+"_job_listing").style.display = "";
            }
        }
        else continue
    }
}

var UpdateUI_PlayerInfo = function() {
    document.getElementById("player_age_y").textContent = Math.trunc(playerdata.resources.time/365);
    document.getElementById("player_age_d").textContent = Math.trunc(playerdata.resources.time%365);

    document.getElementById("player_money").innerHTML = Currency(playerdata.resources.money);
    if (jobs_data[playerdata.active.job]) { document.getElementById("player_income").innerHTML = Currency(jobs_data[playerdata.active.job].earn.value * Scaling(jobs_data[playerdata.active.job].earn.scaling, playerdata.jobs[playerdata.active.job].level)); }
}

//////////////////
// Utility functions

var Scaling = function (scalings, power) {
    let current_mult = 1
    for (let i in scalings) {
        switch(scalings[i].type) {
            case "linear":
                current_mult *= (1+(scalings[i].degree*power))
                break;
            case "exp":
                current_mult *= ((1+scalings[i].degree) ** power)
                break;
            case "falloff":
                current_mult *= Log(power + 1, 1 + (1/scalings[i].degree)) + 1
                break;
            case "log":
                current_mult *= Log(power + 1, scalings[i].degree) + 1
                break;
            default:
                console.log("ERROR: invalid scaling type SCALING."+scalings[i].type.toUpperCase());
                break;
        }
    }
    return current_mult;
}

var Log = function (value, base) {
    return Math.log(value) / Math.log(base);
}

var Currency = function (value, places = 2) { // returns innerHTML for display usage
    if (!currencies) return value;
    if (currencies.length == 0) return value;
    
    let used_places = places;
    let carried_value = value;
    let currency_text = [];

    // check the correct denominations
    for (let i in currencies) {
        if (used_places <= 0) break;
        let currency = currencies[currencies.length -1 -i]; // loop in opposite direction
        if (Math.max(Log(carried_value, 10),0) >= currency.denomination-1) {
            used_places -= 1;
            currency_text.push("<span style=\"color:"+currency.color+"\">"+Math.trunc(carried_value/(10 ** (currency.denomination-1)))+currency.symbol+"</span>")
            carried_value = (carried_value%(10 ** (currency.denomination-1)))
        }
    }

    // construct the HTML
    return currency_text.join(" ")
}

// NOTE: unreliable, only works for numbers that js will not truncate to #.#####e+## form
var Places = function (value, places) {
    value = value * (10 ** places);
    let value_string = value.toString();
    if (value_string.length >= places) {
        return [value_string.slice(0,value_string.length-places),'.',value_string.slice(value_string.length-places)].join('');
    }
    else {
        let output_string = ['.'];
        for (let i = 0; i < (places-value_string.length); i++) {
            output_string.push('0');
        }
        output_string.push(value_string);
        return output_string.join('');
    }
}

//////////////////////// THIS SNIPPET FROM THE INTERNET
function addClass(element, className) {
  const classes = element.className.split(/\s+/);

  if (!classes.includes(className)) {
    element.className +=
      (element.className ? " " : "") + className;
  }
}

function removeClass(element, className) {
  const classes = element.className.split(/\s+/);

  if (classes.includes(className)) {
    element.className = classes
      .filter(cls => cls !== className)
      .join(" ");
  }
}
//////////////////////// END THIS SNIPPET FROM THE INTERNET