// imports
//import {} from 'break_eternity.js'
import { Units, Requirements } from './classes.js'

//////////////////
// variable declaration

// core loop control
const frames_per_second = 50; // number of ms per game tick
var last_frame_ms = Date.now(); // last computed frame in ms

// game loop control
const gain_base_time = 4; // base number of days per second
const gain_base_xp = 10; // base number of xp per day
var is_time_stepping = false; // is time proceeding

window.dev_speed = 1; // speed multiplier for rapid iterative testing without disregarding normal path to get there

//////////////////
// game data

var master_skills_data = {
    "job_xp" : {
        scaling : [
            {type: "linear", degree:0.01},
        ]
    },
    "skill_xp" : {
        scaling : [
            {type: "linear", degree:0.01},
        ]
    },
    "job_pay" : {
        scaling : [
            {type: "linear", degree:0.01},
        ]
    },
    "time_speed" : {
        scaling : [
            {type: "log", degree:6},
        ]
    },
}

//////////////////
// placeholder generated world data
// TODO: actually procedurally generate this
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
        requirements : new Requirements().Add("job", 10, "beggar"),
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
        requirements : new Requirements().Add("job", 10, "farmer"),
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
        requirements : new Requirements().Add("job", 10, "fisher").Add("skill", 10, "strength"),
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
        requirements : new Requirements().Add("job", 10, "miner").Add("skill", 30, "strength"),
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
        requirements : new Requirements().Add("job", 10, "blacksmith").Add("skill", 50, "bargaining"),
    },
}

//window.testreq = new Requirements();
//testreq.Add("job", 20, "beggar");

var skills_data = {
    "concentration" : {
        xp : {
            scaling : [
                {type: "exp", degree:0.01},
                {type: "linear", degree:1},
            ],
            value : 50
        },
        components : [
            {skill: "skill_xp", part: 1, class:'a'}
        ],
    },
    "productivity" : {
        xp : {
            scaling : [
                {type: "exp", degree:0.01},
                {type: "linear", degree:1},
            ],
            value : 50
        },
        components : [
            {skill: "job_xp", part: 1, class:'a'}
        ],
        requirements : new Requirements().Add("skill", 10, "concentration"),
    },
    "charisma" : {
        xp : {
            scaling : [
                {type: "exp", degree:0.01},
                {type: "linear", degree:1},
            ],
            value : 50
        },
        components : [
            {skill: "job_pay", part: 1, class:'a'}
        ],
        requirements : new Requirements(0.3).Add("job", 15, "farmer").Add("skill", 15, "productivity"),
    },
    "arcane presence" : {
        xp : {
            scaling : [
                {type: "exp", degree:0.01},
                {type: "linear", degree:1},
            ],
            value : 500
        },
        components : [
            {skill: "time_speed", part: 1, class:'a'}
        ],
        requirements : new Requirements(0.25).Add("job", 200, "beggar").Add("skill", 200, "concentration").Add("skill", 200, "productivity"),
    },
}

var items_data = {
    "book" : {
        cost : 10,
        components : [
            {skill: "skill_xp", part: 1.5, class:'item'}
        ],
        requirements : new Requirements().Add("money", 1000),
    },
}

// unit formatting in the world
var currencies = [
    {
        symbol: 'c',
        color: "#a64",
        places: 100,
    },
    {
        symbol: 's',
        color: "#999",
        places: 100,
    },
    {
        symbol: 'g',
        color: "#c7bc1d",
        places: 100,
    },
    {
        symbol: 'p',
        color: "#7bc",
        places: 100,
    },
    {
        symbol: 'e',
        color: "#2c7",
        places: 100,
    },
    {
        symbol: 's',
        color: "#66f",
        places: 100,
    },
    {
        symbol: 'r',
        color: "#e33",
        places: 100,
    },
    {
        symbol: 'd',
        color: "#fff",
        places: 1000,
    },
    {
        symbol: '🜂',
        color: "#ff0",
        places: 1000,
    },
]

var Currencies = new Units()
for (let i in currencies) {
    let symbol = currencies[i]
    Currencies.appendSymbol(symbol.symbol, symbol.places, symbol.color)
}

var Time = new Units()
Time.appendSymbol('days', 365)
Time.appendSymbol('years', 1000)
Time.appendSymbol('millenia', 10000)
Time.appendSymbol('epoch', 200)
Time.appendSymbol('eon', 14) // no real end here
Time.setDisplayMode("pre_unstyled")

//////////////////
// player data
var playerdata = {
    jobs : {},
    skills : {},
    skill_effects : {},
    items : {},
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
        if (jobs_data[playerdata.active.job]) { removeCSSClass(document.getElementById(playerdata.active.job+"_job_listing"), "active_job_listing"); } // remove old active job css class
        playerdata.active.job = u_jobname;
        addCSSClass(document.getElementById(playerdata.active.job+"_job_listing"), "active_job_listing");
    }
}

var SelectActiveSkill = function(u_skillname) {
    if (skills_data[u_skillname] && u_skillname != playerdata.active.skill) {
        if (skills_data[playerdata.active.skill]) { removeCSSClass(document.getElementById(playerdata.active.skill+"_skill_listing"), "active_skill_listing"); } // remove old active skill css class
        playerdata.active.skill = u_skillname;
        addCSSClass(document.getElementById(playerdata.active.skill+"_skill_listing"), "active_skill_listing");
    }
}

var SelectItem = function(u_itemname, flag_disable=false) {
    if (items_data[u_itemname]) {
        if (playerdata.items[u_itemname].enabled == true || flag_disable) {
            removeCSSClass(document.getElementById(u_itemname+"_item_listing"), "active_item_listing");
            playerdata.items[u_itemname].enabled = false;
        }
        else {
            addCSSClass(document.getElementById(u_itemname+"_item_listing"), "active_item_listing");
            playerdata.items[u_itemname].enabled = true;
        }
    }
}

var SelectMainContentTab = function(tabname) {
    let main_content_tabs = document.getElementById("main_content").children
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
window.SelectMainContentTab = SelectMainContentTab;

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
window.ToggleTimeStepping = ToggleTimeStepping;

////////////////////////////
// core loop
var Gameloop = function() {
    let delta_ms = Date.now() - last_frame_ms;
    last_frame_ms = Date.now();

    if (is_time_stepping) {
        TickDay(delta_ms);
        CalculateSkillEffects(true);
    }

    UpdateDisplay();

    window.playerdata = playerdata;
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

    // setup each skill
    let skills_holder = document.getElementById("skills_holder")
    for (let skillname in skills_data) {
        let skill = skills_data[skillname];

        // HTML add to holder
        let skill_listing = document.createElement("div"); skills_holder.appendChild(skill_listing); // create holding div
        skill_listing.className = "skill_listing";
        skill_listing.id = skillname+"_skill_listing";

        // HTML button features
        let listing_button = document.createElement("button"); skill_listing.appendChild(listing_button); // create skill selection button
        listing_button.onclick = function() { SelectActiveSkill(skillname) };

        let listing_button_bar = document.createElement("progress"); listing_button.appendChild(listing_button_bar);
        listing_button_bar.max = skill.xp.value; listing_button_bar.value = 0;
        let listing_button_text = document.createElement("span"); listing_button.appendChild(listing_button_text);
        listing_button_text.textContent = skillname.toUpperCase();
        let listing_button_border_div = document.createElement("div"); listing_button.appendChild(listing_button_border_div);

        let listing_info_level = document.createElement("span"); skill_listing.appendChild(listing_info_level);
        listing_info_level.id = skillname + "_level"
        let listing_info_xp_day = document.createElement("span"); skill_listing.appendChild(listing_info_xp_day);
        listing_info_xp_day.id = skillname + "_xp_day"
        let listing_info_xp_left = document.createElement("span"); skill_listing.appendChild(listing_info_xp_left);
        listing_info_xp_left.id = skillname + "_xp_left"
        let listing_info_effect = document.createElement("span"); skill_listing.appendChild(listing_info_effect);
        listing_info_effect.id = skillname + "_effect"

        // HTML create requirements text
        if (skill.requirements) {
            let listing_req_text = document.createElement("div"); skills_holder.appendChild(listing_req_text);
            listing_req_text.style.visibility = "hidden";
            listing_req_text.style.display = "none";
            listing_req_text.className = "req_text"
            listing_req_text.id = skillname+"_req_text"
        }

        // add to playerdata
        playerdata.skills[skillname] = {
            xp : skill.xp.value,
            level : 0,
            effects : [], // effects empty until later setup function
        }
    }

    // setup master skills effect list
    for (let skillname in master_skills_data) {
        playerdata.skill_effects[skillname] = 1.0;
    }

    // setup each item
    let items_holder = document.getElementById("items_holder")
    for (let itemname in items_data) {
        let item = items_data[itemname];

        // HTML add to holder
        let item_listing = document.createElement("div"); items_holder.appendChild(item_listing); // create holding div
        item_listing.className = "item_listing";
        item_listing.id = itemname+"_item_listing";

        // HTML button features
        let listing_button = document.createElement("button"); item_listing.appendChild(listing_button); // create item toggle button
        listing_button.onclick = function() { SelectItem(itemname) };

        let listing_button_text = document.createElement("span"); listing_button.appendChild(listing_button_text);
        listing_button_text.textContent = itemname.toUpperCase();
        let listing_button_border_div = document.createElement("div"); listing_button.appendChild(listing_button_border_div);

        let listing_info_cost = document.createElement("span"); item_listing.appendChild(listing_info_cost);
        listing_info_cost.id = itemname + "_cost"
        let listing_info_effect = document.createElement("span"); item_listing.appendChild(listing_info_effect);
        listing_info_effect.id = itemname + "_effect"

        // HTML create requirements text
        if (item.requirements) {
            let listing_req_text = document.createElement("div"); items_holder.appendChild(listing_req_text);
            listing_req_text.style.visibility = "hidden";
            listing_req_text.style.display = "none";
            listing_req_text.className = "req_text"
            listing_req_text.id = itemname+"_req_text"
        }

        // add to playerdata
        playerdata.items[itemname] = {
            cost: item.cost,
            effects : [], // effects empty until later setup function
            enabled : false,
        }
    }

    /////////////////////////
    // hook core loop to window
    setInterval(Gameloop, 1000/frames_per_second);

    // preform default UI actions
    window.playerdata = playerdata;

    CalculateSkillEffects(true);
    SelectActiveJob("beggar");
    SelectActiveSkill("concentration");
    UpdateUI_Jobs(true);
    UpdateUI_Skills(true);
    SelectMainContentTab("jobs");
    ToggleTimeStepping();
}

window.onload=Setup;

//////////////////
// Mechanical Functions

var TickDay = function(delta_ms) {
    let days_passed = (delta_ms/1000) * gain_base_time * playerdata.skill_effects["time_speed"];
    days_passed *= dev_speed;
    if (days_passed == 0) return;

    // process job tick
    if (jobs_data[playerdata.active.job]) { // make sure job exists
        let job = jobs_data[playerdata.active.job]

        playerdata.resources.money += days_passed * playerdata.jobs[playerdata.active.job].earn * playerdata.skill_effects["job_pay"]; // add income for day
        playerdata.jobs[playerdata.active.job].xp -= days_passed * gain_base_xp * playerdata.skill_effects["job_xp"]; // add xp for day

        // process any job level ups
        while (playerdata.jobs[playerdata.active.job].xp <= 0){
            playerdata.jobs[playerdata.active.job].level += 1
            playerdata.jobs[playerdata.active.job].xp = job.xp.value* Scaling(job.xp.scaling, playerdata.jobs[playerdata.active.job].level) + playerdata.jobs[playerdata.active.job].xp
            playerdata.jobs[playerdata.active.job].earn = job.earn.value* Scaling(job.earn.scaling, playerdata.jobs[playerdata.active.job].level);
        }
    }

    // process skill tick
    if (skills_data[playerdata.active.skill]) { // make sure skill exists
        let skill = skills_data[playerdata.active.skill]

        playerdata.skills[playerdata.active.skill].xp -= days_passed * gain_base_xp * playerdata.skill_effects["skill_xp"]; // add xp for day

        // process any skill level ups
        while (playerdata.skills[playerdata.active.skill].xp <= 0){
            playerdata.skills[playerdata.active.skill].level += 1
            playerdata.skills[playerdata.active.skill].xp = skill.xp.value* Scaling(skill.xp.scaling, playerdata.skills[playerdata.active.skill].level) + playerdata.skills[playerdata.active.skill].xp
        }
    }

    // process item tick
    for (let itemname in items_data) {
        if (playerdata.items[itemname].enabled) {
            let item = playerdata.items[itemname];
            if (playerdata.resources.money <= item.cost) {
                SelectItem(itemname);
                continue;
            }
            playerdata.resources.money -= days_passed * item.cost;
        }
    }

    // update player age
    playerdata.resources.time += days_passed
}

var CalculateSkillEffects = function(flag_reloadall = false) {
    // reload the effect components on the active skill in case of levelup
    for (let skillname in skills_data) {
        if (skillname == playerdata.active.skill || flag_reloadall) {
            let skill = skills_data[skillname];

            playerdata.skills[skillname].effects = [] // TODO: costly operation, fix this by smartly replacing values later
            for (let i in skill.components) {
                let component = skill.components[i]
                let skill_effect = playerdata.skills[skillname].level * component.part;
                playerdata.skills[skillname].effects.push({skill: component.skill, value: skill_effect, class: component.class})
            }
        }
    }

    // reload the effect components on the active items
    if (flag_reloadall) {
        for (let itemname in items_data) {
            let item = items_data[itemname];

            playerdata.items[itemname].effects = [] // TODO: costly operation, fix this by smartly replacing values later
            for (let i in item.components) {
                let component = item.components[i]
                let item_effect = component.part;
                if (playerdata.items[itemname].enabled == false) item_effect = 1;
                playerdata.items[itemname].effects.push({skill: component.skill, value: item_effect, class: component.class})
            }
        }
    }
    
    for (let skillname in master_skills_data) {  // TODO: costly operation, fix this by smartly replacing values later
        playerdata.skill_effects[skillname] = 1.0;
    }

    // add the effective levels of the effect components for each class
    let master_skill_levels = {};
    for (let skillname in master_skills_data) {
        master_skill_levels[skillname] = {};
    }
    for (let skillname in playerdata.skills) {
        let skill_effects = playerdata.skills[skillname].effects;
        for (let i in skill_effects) {
            if (!(master_skill_levels[skill_effects[i].skill][skill_effects[i].class])) master_skill_levels[skill_effects[i].skill][skill_effects[i].class] = 0;
            master_skill_levels[skill_effects[i].skill][skill_effects[i].class] += skill_effects[i].value;
        }
    }
    let unique_class_iterator = 0;
    for (let itemname in playerdata.items) {
        let item_effects = playerdata.items[itemname].effects;
        for (let i in item_effects) {
            unique_class_iterator += 1;
            let unique_class_id = "item." + unique_class_iterator;
            if (item_effects[i].class != 'item')  unique_class_id = item_effects[i].class;
            if (!(master_skill_levels[item_effects[i].skill][unique_class_id])) master_skill_levels[item_effects[i].skill][unique_class_id] = 0;
            master_skill_levels[item_effects[i].skill][unique_class_id] += item_effects[i].value;
        }
    }

    // multiply and save total effects to list
    for (let skillname in master_skill_levels) {
        for (let classname in master_skill_levels[skillname]) {
            let multiplier = 1;
            if (classname.includes('item')) {
                multiplier *= master_skill_levels[skillname][classname];
            }
            else {
                multiplier *= Scaling(master_skills_data[skillname].scaling, master_skill_levels[skillname][classname]);
            }
            playerdata.skill_effects[skillname] *= multiplier;
        }
    }
}

//////////////////
// Display functions

var UpdateDisplay = function() {
    UpdateUI_PlayerInfo();
    UpdateUI_Jobs(true);
    UpdateUI_Skills(true);
    UpdateUI_Items();
    UpdateUI_Visibility();
}

var UpdateUI_Jobs = function(flag_reloadall = false) {
    for (let jobname in jobs_data) {
        if (jobname == playerdata.active.job || flag_reloadall) {
            document.getElementById(jobname + "_level").innerHTML = playerdata.jobs[jobname].level;
            document.getElementById(jobname + "_xp_day").innerHTML = Places(gain_base_xp * playerdata.skill_effects["job_xp"], 1);
            document.getElementById(jobname + "_xp_left").innerHTML = Math.trunc(playerdata.jobs[jobname].xp);
            document.getElementById(jobname + "_earn").innerHTML = Currency(playerdata.jobs[jobname].earn * playerdata.skill_effects["job_pay"]);

            // update progress bar
            let job_bar = document.getElementById(jobname+"_job_listing").getElementsByTagName("button")[0].getElementsByTagName("progress")[0]
            job_bar.max = jobs_data[jobname].xp.value* Scaling(jobs_data[jobname].xp.scaling, playerdata.jobs[jobname].level)
            job_bar.value = job_bar.max - playerdata.jobs[jobname].xp
        }
    }
}

var UpdateUI_Skills = function(flag_reloadall = false) {
    for (let skillname in skills_data) {
        if (skillname == playerdata.active.skill || flag_reloadall) {
            document.getElementById(skillname + "_level").innerHTML = playerdata.skills[skillname].level;
            document.getElementById(skillname + "_xp_day").innerHTML = Places(gain_base_xp * playerdata.skill_effects["skill_xp"], 1);
            document.getElementById(skillname + "_xp_left").innerHTML = Math.trunc(playerdata.skills[skillname].xp);
            document.getElementById(skillname + "_effect").innerHTML = "+"+ Places(playerdata.skills[skillname].effects[0].value, 2) + " " + playerdata.skills[skillname].effects[0].class + ":" + playerdata.skills[skillname].effects[0].skill;

            // update progress bar
            let skill_bar = document.getElementById(skillname+"_skill_listing").getElementsByTagName("button")[0].getElementsByTagName("progress")[0]
            skill_bar.max = skills_data[skillname].xp.value* Scaling(skills_data[skillname].xp.scaling, playerdata.skills[skillname].level)
            skill_bar.value = skill_bar.max - playerdata.skills[skillname].xp
        }
    }
}

var UpdateUI_Items = function() {
    for (let itemname in items_data) {
        document.getElementById(itemname + "_cost").innerHTML = Currency(items_data[itemname].cost);
        document.getElementById(itemname + "_effect").innerHTML = "x"+ Places(playerdata.items[itemname].effects[0].value, 2) + " " + playerdata.items[itemname].effects[0].skill;
    }
}

var UpdateUI_Visibility = function() {
    for (let jobname in jobs_data) {
        if (jobs_data[jobname].requirements) {
            let visible = jobs_data[jobname].requirements.Done();
            let req_text = jobs_data[jobname].requirements.Text();

            if (visible == 1) {
                document.getElementById(jobname+"_req_text").style.visibility = "visible";
                document.getElementById(jobname+"_req_text").style.display = "";
                document.getElementById(jobname+"_req_text").innerHTML = req_text;
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
    
    for (let skillname in skills_data) {
        if (skills_data[skillname].requirements) {
            let visible = skills_data[skillname].requirements.Done();
            let req_text = skills_data[skillname].requirements.Text();

            if (visible == 1) {
                document.getElementById(skillname+"_req_text").style.visibility = "visible";
                document.getElementById(skillname+"_req_text").style.display = "";
                document.getElementById(skillname+"_req_text").innerHTML = req_text;
            }
            else {
                document.getElementById(skillname+"_req_text").style.visibility = "hidden";
                document.getElementById(skillname+"_req_text").style.display = "none";
            }
            
            if (visible < 2) {
                document.getElementById(skillname+"_skill_listing").style.visibility = "hidden";
                document.getElementById(skillname+"_skill_listing").style.display = "none";
            }
            else {
                document.getElementById(skillname+"_skill_listing").style.visibility = "visible";
                document.getElementById(skillname+"_skill_listing").style.display = "";
            }
        }
        else continue
    }

    for (let itemname in items_data) {
        if (items_data[itemname].requirements) {
            let visible = items_data[itemname].requirements.Done();
            let req_text = items_data[itemname].requirements.Text();

            if (visible == 1) {
                document.getElementById(itemname+"_req_text").style.visibility = "visible";
                document.getElementById(itemname+"_req_text").style.display = "";
                document.getElementById(itemname+"_req_text").innerHTML = req_text;
            }
            else {
                document.getElementById(itemname+"_req_text").style.visibility = "hidden";
                document.getElementById(itemname+"_req_text").style.display = "none";
            }
            
            if (visible < 2) {
                document.getElementById(itemname+"_item_listing").style.visibility = "hidden";
                document.getElementById(itemname+"_item_listing").style.display = "none";
            }
            else {
                document.getElementById(itemname+"_item_listing").style.visibility = "visible";
                document.getElementById(itemname+"_item_listing").style.display = "";
            }
        }
        else continue
    }
}

var UpdateUI_PlayerInfo = function() {
    //document.getElementById("player_age_y").textContent = Math.trunc(playerdata.resources.time/365);
    //document.getElementById("player_age_d").textContent = Math.trunc(playerdata.resources.time%365);
    document.getElementById("player_age").innerHTML = Time.format(playerdata.resources.time);

    document.getElementById("player_money").innerHTML = Currency(playerdata.resources.money);
    let income = jobs_data[playerdata.active.job].earn.value * Scaling(jobs_data[playerdata.active.job].earn.scaling, playerdata.jobs[playerdata.active.job].level) * playerdata.skill_effects["job_pay"];
    let expenses = 0;
    for (let itemname in items_data) {
        if (playerdata.items[itemname].enabled) {
            expenses -= items_data[itemname].cost;
        }
    }
    document.getElementById("player_net_money").innerHTML = Currency(income + expenses);
    document.getElementById("player_income").innerHTML = Currency(income);
    document.getElementById("player_expenses").innerHTML = Currency(expenses);
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
    return Currencies.format(value, places);
}
window.Currency = Currency;

var Places = function (value, places) {
    value *= (10 ** places);
    value = Math.trunc(value);
    value /= (10 ** places);
    return value;
}

//////////////////////// THIS SNIPPET FROM THE INTERNET
function addCSSClass(element, className) {
  const classes = element.className.split(/\s+/);

  if (!classes.includes(className)) {
    element.className +=
      (element.className ? " " : "") + className;
  }
}

function removeCSSClass(element, className) {
  const classes = element.className.split(/\s+/);

  if (classes.includes(className)) {
    element.className = classes
      .filter(cls => cls !== className)
      .join(" ");
  }
}
//////////////////////// END THIS SNIPPET FROM THE INTERNET