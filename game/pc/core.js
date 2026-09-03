// variable declaration

// core loop control
deltams = 100; // number of ms per game tick

// jobs statistics
var jobs_data = {
    "beggar" : {
        xp : {
            scaling : [
                {type: "exp", degree:0.1},
            ],
            value : 100
        },
        earn : {
            scaling : [
                {type: "linear", degree:0.02},
                {type: "falloff", degree:0.1},
            ],
            value : 5
        },
    },
    "farmer" : {
        xp : {
            scaling : [
                {type: "exp", degree:0.1},
            ],
            value : 200
        },
        earn : {
            scaling : [
                {type: "linear", degree:0.02},
                {type: "falloff", degree:0.1},
            ],
            value : 9
        },
    },
    "fisher" : {
        xp : {
            scaling : [
                {type: "exp", degree:0.1},
            ],
            value : 500
        },
        earn : {
            scaling : [
                {type: "linear", degree:0.02},
                {type: "falloff", degree:0.1},
            ],
            value : 15
        },
    },
    "miner" : {
        xp : {
            scaling : [
                {type: "exp", degree:0.1},
            ],
            value : 2000
        },
        earn : {
            scaling : [
                {type: "linear", degree:0.02},
                {type: "falloff", degree:0.1},
            ],
            value : 45
        },
    },
    "blacksmith" : {
        xp : {
            scaling : [
                {type: "exp", degree:0.1},
            ],
            value : 10000
        },
        earn : {
            scaling : [
                {type: "linear", degree:0.02},
                {type: "falloff", degree:0.1},
            ],
            value : 100
        },
    },
    "merchant" : {
        xp : {
            scaling : [
                {type: "exp", degree:0.1},
            ],
            value : 100000
        },
        earn : {
            scaling : [
                {type: "linear", degree:0.02},
                {type: "falloff", degree:0.1},
            ],
            value : 200
        },
    },
}

// player data
var playerdata = {
    jobs : {

    },
    active : {
        job : "none",
        skill : -1,
    },
    resources : {
        money : 0,
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
        console.log(i)
        if (isNaN(i)) {}
        else {
            if (main_content_tabs[i].id == tabname+"_holder") {
                main_content_tabs[i].style.visibility = "visible";
            }
            else {
                main_content_tabs[i].style.visibility = "hidden";
            }
        }
    }
}

////////////////////////////
// core loop
var Gameloop = function() {
    TickDay();
    UpdateDisplay();
}

var Setup = function() {
    // setup each job
    let jobs_holder = document.getElementById("jobs_holder")
    for (let jobname in jobs_data) {
        let job = jobs_data[jobname];

        // add to holder
        let job_listing = document.createElement("div"); jobs_holder.appendChild(job_listing); // create holding div
        job_listing.className = "job_listing";
        job_listing.id = jobname+"_job_listing";

        let listing_button = document.createElement("button"); job_listing.appendChild(listing_button); // create job selection button
        listing_button.onclick = function() { SelectActiveJob(jobname) };

        let listing_button_bar = document.createElement("progress"); listing_button.appendChild(listing_button_bar);
        listing_button_bar.max = job.xp.value; listing_button_bar.value = 0;
        let listing_button_text = document.createElement("span"); listing_button.appendChild(listing_button_text);
        listing_button_text.textContent = jobname.toUpperCase();


        let listing_info = document.createElement("span"); job_listing.appendChild(listing_info); // add job info
        listing_info.innerHTML = " <span id=\"" + jobname + "_level\">###</span> | XP: <span id=\"" + jobname + "_xp_left\">###</span> | Income: <span id=\"" + jobname + "_earn\">###</span>";

        // add to playerdata
        playerdata.jobs[jobname] = {
            xp : job.xp.value,
            level : 0,
            earn : job.earn.value,
        }
    }

    setInterval(Gameloop, deltams);
    SelectActiveJob("beggar");
}

window.onload=Setup;

//////////////////
// Mechanical Functions

var TickDay = function() {
    if (jobs_data[playerdata.active.job]) { // make sure job exists
        let job = jobs_data[playerdata.active.job]

        playerdata.resources.money += playerdata.jobs[playerdata.active.job].earn // add income for day

        playerdata.jobs[playerdata.active.job].xp -= 10 // add xp for day

        // process any level ups
        if (playerdata.jobs[playerdata.active.job].xp <= 0){
            playerdata.jobs[playerdata.active.job].level += 1
            playerdata.jobs[playerdata.active.job].xp = job.xp.value* Scaling(job.xp.scaling, playerdata.jobs[playerdata.active.job].level) + playerdata.jobs[playerdata.active.job].xp
            playerdata.jobs[playerdata.active.job].earn = job.earn.value* Scaling(job.earn.scaling, playerdata.jobs[playerdata.active.job].level);
        }
    }
}

//////////////////
// Display functions

var UpdateDisplay = function() {
    UpdateText_PlayerInfo();
    UpdateText_Jobs();
}

var UpdateText_Jobs = function() {
    for (let jobname in jobs_data) {
        document.getElementById(jobname + "_level").innerHTML = playerdata.jobs[jobname].level;
        document.getElementById(jobname + "_xp_left").innerHTML = Math.trunc(playerdata.jobs[jobname].xp);
        document.getElementById(jobname + "_earn").innerHTML = Math.trunc(playerdata.jobs[jobname].earn);

        // update progress bar
        let job_bar = document.getElementById(jobname+"_job_listing").getElementsByTagName("button")[0].getElementsByTagName("progress")[0]
        job_bar.max = jobs_data[jobname].xp.value* Scaling(jobs_data[jobname].xp.scaling, playerdata.jobs[jobname].level)
        job_bar.value = job_bar.max - playerdata.jobs[jobname].xp
    }
}

var UpdateText_PlayerInfo = function() {
    document.getElementById("player_money").textContent = Math.trunc(playerdata.resources.money);
    if (jobs_data[playerdata.active.job]) { document.getElementById("player_income").textContent = Math.trunc(jobs_data[playerdata.active.job].earn.value * Scaling(jobs_data[playerdata.active.job].earn.scaling, playerdata.jobs[playerdata.active.job].level)); }
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