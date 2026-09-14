// imports
//import {} from 'break_eternity.js'
import { Units, Requirements, Listable, Levelable, Job, Skill, Buyable } from './classes.js'

//////////////////
// variable declaration

// core loop control
const frames_per_second = 50; // number of ms per game tick
var last_frame_ms = Date.now(); // last computed frame in ms

// game loop control
const gain_base_time = 4; // base number of days per second
const gain_base_xp = 10; // base number of xp per day
window.gain_base_xp = gain_base_xp;
var is_time_stepping = false; // is time proceeding

// visual/display settings
window.number_display_mode = "standard";
const number_display_modes = ["standard", "e", "unformatted"]

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
            {type: "linear", degree:0.001},
            {type: "log", degree:100},
        ]
    },
    "qol_all" : {
        scaling : [
            {type: "linear", degree:0.01},
        ]
    },
    "item_cost" : {
        scaling : [
            {type: "exp", degree:-0.01, softcap: {start: 50, strength: 0.5}},
        ]
    },
    "xp_all_spillover" : {
        scaling : [
            {type: "linear", degree:0.01},
        ]
    },
    "military_job_pay" : {
        scaling : [
            {type: "linear", degree:0.01},
        ]
    },
    "military_job_xp" : {
        scaling : [
            {type: "linear", degree:0.01},
        ]
    },
    "strength_skill_xp" : {
        scaling : [
            {type: "linear", degree:0.01},
        ]
    },
}

//////////////////
// placeholder generated world data
// TODO: actually procedurally generate this
var jobs_data = {
    "beggar" : {
        xp : { value : 50 },
        earn : { value : 5 },
        category: "mortal",
    },
    "farmer" : {
        xp : { value : 100 },
        earn : { value : 9 },
        category: "mortal",
        requirements : new Requirements().Add("job", 10, {name:"beggar"}),
    },
    "fisher" : {
        xp : { value : 200 },
        earn : { value : 15 },
        category: "mortal",
        requirements : new Requirements().Add("job", 10, {name:"farmer"}),
    },
    "miner" : {
        xp : { value : 400 },
        earn : { value : 40 },
        category: "mortal",
        requirements : new Requirements().Add("job", 10, {name:"fisher"}).Add("skill", 10, {name:"strength"}),
    },
    "blacksmith" : {
        xp : { value : 800 },
        earn : { value : 80 },
        category: "mortal",
        requirements : new Requirements().Add("job", 10, {name:"miner"}).Add("skill", 30, {name:"strength"}),
    },
    "merchant" : {
        xp : { value : 1600 },
        earn : { value : 150 },
        category: "mortal",
        requirements : new Requirements().Add("job", 10, {name:"blacksmith"}).Add("skill", 50, {name:"bargaining"}),
    },

    "squire" : {
        xp : { value : 100 },
        earn : { value : 5 },
        category: "military",
        requirements : new Requirements().Add("skill", 5, {name:"strength"}).Add("job", 1, {name:"bandit", reverse:true}),
    },
    "footman" : {
        xp : { value : 1000 },
        earn : { value : 50 },
        category: "military",
        requirements : new Requirements().Add("skill", 40, {name:"strength"}).Add("job", 10, {name:"squire"}).Add("job", 1, {name:"bandit", reverse:true}),
    },
    "veteran footman" : {
        xp : { value : 10000 },
        earn : { value : 120 },
        category: "military",
        requirements : new Requirements().Add("skill", 40, {name:"battle tactics"}).Add("job", 10, {name:"footman"}).Add("job", 1, {name:"bandit", reverse:true}),
    },
    "centenary" : {
        xp : { value : 100000 },
        earn : { value : 300 },
        category: "military",
        requirements : new Requirements().Add("skill", 100, {name:"strength"}).Add("job", 10, {name:"veteran footman"}).Add("job", 1, {name:"bandit", reverse:true}),
    },
    "knight" : {
        xp : { value : 1000000 },
        earn : { value : 1000 },
        category: "military",
        requirements : new Requirements().Add("skill", 150, {name:"battle tactics"}).Add("job", 10, {name:"centenary"}).Add("job", 1, {name:"bandit", reverse:true}),
    },
    "veteran knight" : {
        xp : { value : 7500000 },
        earn : { value : 3000 },
        category: "military",
        requirements : new Requirements().Add("skill", 300, {name:"strength"}).Add("job", 10, {name:"knight"}).Add("job", 1, {name:"bandit", reverse:true}),
    },
    "holy knight" : {
        xp : { value : 40000000 },
        earn : { value : 15000 },
        category: "military",
        requirements : new Requirements().Add("skill", 500, {name:"mana control"}).Add("job", 10, {name:"veteran knight"}).Add("job", 1, {name:"bandit", reverse:true}),
    },
    "lieutenant general" : {
        xp : { value : 150000000 },
        earn : { value : 50000 },
        category: "military",
        requirements : new Requirements().Add("skill", 1000, {name:"battle tactics"}).Add("skill", 1000, {name:"mana control"}).Add("job", 10, {name:"holy knight"}).Add("job", 1, {name:"bandit", reverse:true}),
    },

    "bandit" : {
        xp : { value : 1000 },
        earn : { value : 100 },
        category: "military",
        requirements : new Requirements().Add("skill", 10, {name:"strength"}),
    },
    "bandit captain" : {
        xp : { value : 10000 },
        earn : { value : 250 },
        category: "military",
        requirements : new Requirements().Add("skill", 50, {name:"strength"}).Add("skill", 50, {name:"battle tactics"}).Add("job", 10, {name:"bandit"}),
    },
}

var skills_data = {
    "concentration" : {
        xp : { value : 50 },
        components : [
            {skill: "skill_xp", part: 1, class:'a'}
        ],
        category: "fundamentals",
    },
    "productivity" : {
        xp : { value : 50 },
        components : [
            {skill: "job_xp", part: 1, class:'a'}
        ],
        category: "fundamentals",
        requirements : new Requirements().Add("skill", 5, {name:"concentration"}),
    },
    "bargaining" : {
        xp : { value : 50 },
        components : [
            {skill: "item_cost", part: 1, class:'a'}
        ],
        category: "fundamentals",
        requirements : new Requirements(0.3).Add("job", 15, {name:"farmer"}).Add("skill", 15, {name:"productivity"}),
    },
    "meditation" : {
        xp : { value : 50 },
        components : [
            {skill: "qol_all", part: 1, class:'a'}
        ],
        category: "fundamentals",
        requirements : new Requirements(0.3).Add("skill", 30, {name:"concentration"}).Add("skill", 20, {name:"productivity"}),
    },
    "polymath" : {
        xp : { value : 100 },
        components : [
            {skill: "xp_all_spillover", part: 1, class:'a'}
        ],
        category: "fundamentals",
        requirements : new Requirements(0.15).Add("age", (365*25), {reverse:true}).Add("job", 20, {name:"beggar"}).Add("skill", 25, {name:"concentration"}).Add("skill", 25, {name:"productivity"}),
    },
    "charisma" : {
        xp : { value : 50 },
        components : [
            {skill: "job_pay", part: 1, class:'a'}
        ],
        category: "fundamentals",
        requirements : new Requirements(0.3).Add("job", 25, {name:"merchant"}).Add("skill", 75, {name:"bargaining"}).Add("job", 9999, {name:"beggar"}),
    },

    "strength" : {
        xp : { value : 50 },
        components : [
            {skill: "military_job_pay", part: 1, class:'a'}
        ],
        category: "combat",
    },
    "battle tactics" : {
        xp : { value : 50 },
        components : [
            {skill: "military_job_xp", part: 1, class:'a'}
        ],
        category: "combat",
        requirements : new Requirements().Add("skill", 20, {name:"concentration"}),
    },
    "muscle memory" : {
        xp : { value : 50 },
        components : [
            {skill: "strength_skill_xp", part: 1, class:'a'}
        ],
        category: "combat",
        requirements : new Requirements().Add("skill", 30, {name:"concentration"}).Add("skill", 30, {name:"strength"}),
    },

    "arcane presence" : {
        xp : { value : 500 },
        components : [
            {skill: "time_speed", part: 1, class:'a'}
        ],
        category: "magic",
        requirements : new Requirements(0.25).Add("skill", 200, {name:"concentration"}).Add("skill", 200, {name:"meditation"}).Add("job", 9999, {name:"beggar"}),
    },
}

var items_data = {
    "tent" : {
        singleton : "home",
        cost : 15,
        components : [
            {skill: "qol_all", part: 1.4, class:'item'}
        ],
        requirements : new Requirements().Add("money", 1500),
    },
    "hut" : {
        singleton : "home",
        cost : 100,
        components : [
            {skill: "qol_all", part: 2, class:'item'}
        ],
        requirements : new Requirements().Add("money", 10000),
    },
    "cottage" : {
        singleton : "home",
        cost : 750,
        components : [
            {skill: "qol_all", part: 3.5, class:'item'}
        ],
        requirements : new Requirements().Add("money", 75000),
    },
    "house" : {
        singleton : "home",
        cost : 3000,
        components : [
            {skill: "qol_all", part: 6, class:'item'}
        ],
        requirements : new Requirements().Add("money", 300000),
    },
    "mansion" : {
        singleton : "home",
        cost : 25000,
        components : [
            {skill: "qol_all", part: 12, class:'item'}
        ],
        requirements : new Requirements().Add("money", 2500000),
    },
    "skyscraper" : {
        singleton : "home",
        cost : 300000,
        components : [
            {skill: "qol_all", part: 25, class:'item'}
        ],
        requirements : new Requirements().Add("money", 30000000),
    },
    "palace" : {
        singleton : "home",
        cost : 5000000,
        components : [
            {skill: "qol_all", part: 60, class:'item'}
        ],
        requirements : new Requirements().Add("money", 500000000),
    },

    "book" : {
        cost : 10,
        components : [
            {skill: "skill_xp", part: 1.5, class:'item'}
        ],
        requirements : new Requirements().Add("money", 1000),
    },
    "dumbbells" : {
        cost : 50,
        components : [
            {skill: "strength_skill_xp", part: 1.5, class:'item'}
        ],
        requirements : new Requirements().Add("money", 5000),
    },
    "personal squire" : {
        cost : 200,
        components : [
            {skill: "job_xp", part: 2, class:'item'}
        ],
        requirements : new Requirements().Add("money", 20000),
    },
    "steel longsword" : {
        cost : 1000,
        components : [
            {skill: "military_job_xp", part: 2, class:'item'}
        ],
        requirements : new Requirements().Add("money", 100000),
    },
    "butler" : {
        cost : 7500,
        components : [
            {skill: "qol_all", part: 1.5, class:'item'}
        ],
        requirements : new Requirements().Add("money", 750000),
    },
    "sapphire charm" : {
        cost : 50000,
        components : [
            {skill: "skill_xp", part: 1, class:'item'}
        ],
        requirements : new Requirements().Add("money", 5000000),
    },
    "study desk" : {
        cost : 1000000,
        components : [
            {skill: "skill_xp", part: 2, class:'item'}
        ],
        requirements : new Requirements().Add("money", 100000000),
    },
    "library" : {
        cost : 10000000,
        components : [
            {skill: "skill_xp", part: 1.5, class:'item'}
        ],
        requirements : new Requirements().Add("money", 1000000000),
    },
}

var categories_data = {
    mortal: "#568b40",
    military: "#853737",

    fundamentals: "#568b40",
    combat: "#853737",
    magic: "#b33c83",

    home: "#4d97aa",
    misc: "#7b8e8f",
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
window.Time = Time;

var StandardNotation = new Units()
StandardNotation.appendSymbol('', 1000)
StandardNotation.appendSymbol('k', 1000)
StandardNotation.appendSymbol('M', 1000)
StandardNotation.appendSymbol('B', 1000)
StandardNotation.appendSymbol('T', 1000)
StandardNotation.appendSymbol('Qa', 1000)
StandardNotation.appendSymbol('Qu', 1000)
StandardNotation.appendSymbol('Sx', 1000)
StandardNotation.appendSymbol('Sp', 1000)
StandardNotation.appendSymbol('Oc', 1000)
StandardNotation.appendSymbol('No', 1000)
StandardNotation.appendSymbol('Dc', 1000)
StandardNotation.setDisplayMode("post_d2");

//////////////////
// game data
window.playerdata = {
    skill_effects : {},
    active : {
        job : "none",
        skill : "none",
    },
    resources : {
        money : 0,
        time : 14*365,
    }
}

window.worlddata = {
    jobs: {},
    skills: {},
    items : {},
}

//////////////////
// User interaction functions

var SelectActiveJob = function(u_jobname) {
    worlddata.jobs[u_jobname].SetActive();
}

var SelectActiveSkill = function(u_skillname) {
    worlddata.skills[u_skillname].SetActive();
}

var SelectItem = function(u_itemname) {
    worlddata.items[u_itemname].SetActive();
    if (worlddata.items[u_itemname].GetSingleton()) VerifyItemSingletons(worlddata.items[u_itemname].GetSingleton());
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
        pause_button.textContent = "⏸";
        pause_button.style.backgroundColor = "#533";
    }
    else {
        pause_button.textContent = "▶";
        pause_button.style.backgroundColor = "#353";
    }
}
window.ToggleTimeStepping = ToggleTimeStepping;

var SetNumberDisplayMode = function(u_number_display_mode) {
    let valid_mode = false
    for (let i in number_display_modes) {
        if (number_display_modes[i] == u_number_display_mode) {
            number_display_mode = u_number_display_mode;
            valid_mode = true;
        }
    }
    if (!valid_mode) number_display_mode = number_display_modes[0];
}
window.SetNumberDisplayMode = SetNumberDisplayMode;

////////////////////////////
// core loop
var Gameloop = function() {
    window.playerdata = playerdata;
    window.worlddata = worlddata;

    let delta_ms = Date.now() - last_frame_ms;
    last_frame_ms = Date.now();

    if (is_time_stepping) {
        TickDay(delta_ms);
        CalculateSkillEffects(true);
        ValidateActive();
    }

    UpdateDisplay();
}

var Setup = async function() {
    document.getElementById("content_area").innerHTML = await fromFile("world.html");

    let created_categories = [];

    // setup each job
    let jobs_holder = document.getElementById("jobs_holder")
    for (let jobname in jobs_data) {
        let job = jobs_data[jobname];

        if (!created_categories.includes(job.category)) {
            let category_header = document.createElement("div"); jobs_holder.appendChild(category_header);
            category_header.className = "listing_header";
            category_header.style.backgroundColor = categories_data[job.category];
            category_header.innerHTML = "<div>"+job.category+"</div><div>Level</div><div>XP/day</div><div>XP to Level</div><div>Income</div>";
            created_categories.push(job.category);
            category_header.id = "category_job_"+job.category;
        }

        // HTML add to holder
        let job_listing = document.createElement("div"); jobs_holder.appendChild(job_listing); // create holding div
        job_listing.className = "job_listing";
        job_listing.id = jobname+"_listing";

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
        //if (job.requirements) {
        let listing_req_text = document.createElement("div"); jobs_holder.appendChild(listing_req_text);
        listing_req_text.style.visibility = "hidden";
        listing_req_text.style.display = "none";
        listing_req_text.className = "req_text"
        listing_req_text.id = jobname+"_req_text"
        //}

        // add to worlddata
        worlddata.jobs[jobname] = new Job(jobname, job.category, job.xp["value"], job.earn["value"]);
        worlddata.jobs[jobname].requirements = job.requirements;
        worlddata.jobs[jobname].AddMultiplier("xp", "job_xp");
        worlddata.jobs[jobname].AddMultiplier("xp", "qol_all");
        worlddata.jobs[jobname].AddMultiplier("earn", "job_pay");
        worlddata.jobs[jobname].AddMultiplier("xp_inactive", "xp_all_spillover");
        worlddata.jobs[jobname].AddMultiplier("xp", "military_job_xp", {category: "military"});
        worlddata.jobs[jobname].AddMultiplier("earn", "military_job_pay", {category: "military"});

        if (worlddata.jobs[jobname].GetRequirements().HasReverse()) {
            let requirement_warning = document.createElement("div"); job_listing.appendChild(requirement_warning);
            requirement_warning.className = "requirement_warning_symbol";
            requirement_warning.id = jobname + "_req_reverse_warn";
            requirement_warning.innerHTML = "!<span>###</span>"
        }
    }

    created_categories = [];
    // setup each skill
    let skills_holder = document.getElementById("skills_holder")
    for (let skillname in skills_data) {
        let skill = skills_data[skillname];

        if (!created_categories.includes(skill.category)) {
            let category_header = document.createElement("div"); skills_holder.appendChild(category_header);
            category_header.className = "listing_header";
            category_header.style.backgroundColor = categories_data[skill.category];
            category_header.innerHTML = "<div>"+skill.category+"</div><div>Level</div><div>XP/day</div><div>XP to Level</div><div>Effect</div>";
            created_categories.push(skill.category);
            category_header.id = "category_skill_"+skill.category;
        }

        // HTML add to holder
        let skill_listing = document.createElement("div"); skills_holder.appendChild(skill_listing); // create holding div
        skill_listing.className = "skill_listing";
        skill_listing.id = skillname+"_listing";

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
        //if (skill.requirements) {
        let listing_req_text = document.createElement("div"); skills_holder.appendChild(listing_req_text);
        listing_req_text.style.visibility = "hidden";
        listing_req_text.style.display = "none";
        listing_req_text.className = "req_text"
        listing_req_text.id = skillname+"_req_text"
        //}

        // add to worlddata
        worlddata.skills[skillname] = new Skill(skillname, skill.category, skill.xp["value"], skill.components);
        worlddata.skills[skillname].requirements = skill.requirements;
        worlddata.skills[skillname].AddMultiplier("xp", "skill_xp");
        worlddata.skills[skillname].AddMultiplier("xp", "qol_all");
        worlddata.skills[skillname].AddMultiplier("xp_inactive", "xp_all_spillover");
        worlddata.skills[skillname].AddMultiplier("xp", "strength_skill_xp", {name: "strength"});

        if (worlddata.skills[skillname].GetRequirements().HasReverse()) {
            let requirement_warning = document.createElement("div"); skill_listing.appendChild(requirement_warning);
            requirement_warning.className = "requirement_warning_symbol";
            requirement_warning.id = skillname + "_req_reverse_warn";
            requirement_warning.innerHTML = "!<span>###</span>"
        }
    }

    // setup master skills effect list
    for (let skillname in master_skills_data) {
        playerdata.skill_effects[skillname] = 1.0;
    }

    created_categories = [];
    // setup each item
    let items_holder = document.getElementById("items_holder")
    for (let itemname in items_data) {
        let item = items_data[itemname];

        let item_category = item.singleton;
        if (!item_category) item_category = "misc";
        if (!created_categories.includes(item_category)) {
            let category_header = document.createElement("div"); items_holder.appendChild(category_header);
            category_header.className = "listing_header";
            category_header.style.backgroundColor = categories_data[item_category];
            category_header.innerHTML = "<div>"+item_category+"</div><div>Cost/day</div><div>Effect</div>";
            created_categories.push(item_category);
            category_header.id = "category_item_"+item_category;
        }

        // HTML add to holder
        let item_listing = document.createElement("div"); items_holder.appendChild(item_listing); // create holding div
        item_listing.className = "item_listing";
        item_listing.id = itemname+"_listing";

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
        //if (item.requirements) {
        let listing_req_text = document.createElement("div"); items_holder.appendChild(listing_req_text);
        listing_req_text.style.visibility = "hidden";
        listing_req_text.style.display = "none";
        listing_req_text.className = "req_text"
        listing_req_text.id = itemname+"_req_text"
        //}

        // add to worlddata
        worlddata.items[itemname] = new Buyable(itemname, item.cost, item.components);
        if (item.singleton) worlddata.items[itemname].SetSingleton(item.singleton);
        worlddata.items[itemname].AddMultiplier("cost", "item_cost");

        if (worlddata.items[itemname].GetRequirements().HasReverse()) {
            let requirement_warning = document.createElement("div"); item_listing.appendChild(requirement_warning);
            requirement_warning.className = "requirement_warning_symbol";
            requirement_warning.id = itemname + "_req_reverse_warn";
            requirement_warning.innerHTML = "!<span>###</span>"
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

    // hook in hotkey input
    window.addEventListener('keydown', function(e) {
        if(e.key==" " && !e.repeat ) {
            ToggleTimeStepping()
            if(e.target == document.body) {
                e.preventDefault();
            }
        }
    });
}

window.onload=Setup;

//////////////////
// Mechanical Functions

var TickDay = function(delta_ms) {
    let days_passed = (delta_ms/1000) * gain_base_time * playerdata.skill_effects["time_speed"];
    days_passed *= dev_speed;
    if (days_passed == 0) return;

    // process job tick
    for (let id in worlddata.jobs) {
        worlddata.jobs[id].Tick(days_passed);
    }

    // process skill tick
    for (let id in worlddata.skills) {
        worlddata.skills[id].Tick(days_passed);
    }

    // process item tick
    for (let id in worlddata.items) {
        worlddata.items[id].Tick(days_passed);
    }

    // update player age
    playerdata.resources.time += days_passed
}

var CalculateSkillEffects = function(flag_reloadall = false) {
    for (let skillname in master_skills_data) {  // TODO: costly operation, fix this by smartly replacing values later
        playerdata.skill_effects[skillname] = 1.0;
    }

    // add the effective levels of the effect components for each class
    let master_skill_levels = {};
    for (let skillname in master_skills_data) {
        master_skill_levels[skillname] = {};
    }
    for (let skillname in worlddata.skills) {
        let skill_effects = worlddata.skills[skillname].Effects();
        for (let i in skill_effects) {
            if (!(master_skill_levels[skill_effects[i].skill][skill_effects[i].class])) master_skill_levels[skill_effects[i].skill][skill_effects[i].class] = 0;
            master_skill_levels[skill_effects[i].skill][skill_effects[i].class] += skill_effects[i].value;
        }
    }
    let unique_class_iterator = 0;
    for (let itemname in worlddata.items) {
        let item_effects = worlddata.items[itemname].Effects();
        for (let i in item_effects) {
            unique_class_iterator += 1;
            let unique_class_id = "item-" + unique_class_iterator;
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

var VerifyItemSingletons = function(singleton_id) {
    for (let id in worlddata.items) {
        let item_l = worlddata.items[id];
        if (item_l.GetSingleton() != singleton_id) continue;
        for (let id_other in worlddata.items) {
            let item_r = worlddata.items[id_other];
            if (item_r.GetSingleton() != singleton_id) continue;
            if (item_l.GetActive() && item_r.GetActive()) {
                if (!item_l.CompareSingletonPriority(item_r)) {
                    item_l.SetActive(true);
                }
            }
        }
    }
}

var ValidateActive = function() {
    if (worlddata.jobs[playerdata.active.job].GetRequirements().Done(true) != 2) {
        for (let id in worlddata.jobs) {
            if (worlddata.jobs[id].GetRequirements().Done(true) == 2) {
                SelectActiveJob(id);
                break;
            }
        }
    }
    if (worlddata.skills[playerdata.active.skill].GetRequirements().Done(true) != 2) {
        for (let id in worlddata.skills) {
            if (worlddata.skills[id].GetRequirements().Done(true) == 2) {
                SelectActiveSkill(id);
                break;
            }
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
    for (let id in worlddata.jobs) {
        worlddata.jobs[id].UpdateUI();
    }
}

var UpdateUI_Skills = function(flag_reloadall = false) {
    for (let id in worlddata.skills) {
        worlddata.skills[id].UpdateUI();
    }
}

var UpdateUI_Items = function() {
    for (let id in worlddata.items) {
        worlddata.items[id].UpdateUI();
    }
}

var UpdateUI_Visibility = function() {
    // listing visibility
    let visibility_listings = [];
    let visibility_headers = {};
    for (let id in worlddata.jobs) {
        if (worlddata.jobs[id].GetRequirements()) {
            visibility_listings.push({id: id, visible: worlddata.jobs[id].GetRequirements().Done(), req_text: worlddata.jobs[id].GetRequirements().Text()});
            
            if (!visibility_headers["category_job_"+worlddata.jobs[id].GetCategory()]) {
                visibility_headers["category_job_"+worlddata.jobs[id].GetCategory()] = 0;
            }
            if (worlddata.jobs[id].GetRequirements().Done() == 2) visibility_headers["category_job_"+worlddata.jobs[id].GetCategory()] += 1;
        }
    }
    for (let id in worlddata.skills) {
        if (worlddata.skills[id].GetRequirements()) {
            visibility_listings.push({id: id, visible: worlddata.skills[id].GetRequirements().Done(), req_text: worlddata.skills[id].GetRequirements().Text()});
        
            if (!visibility_headers["category_skill_"+worlddata.skills[id].GetCategory()]) {
                visibility_headers["category_skill_"+worlddata.skills[id].GetCategory()] = 0;
            }
            if (worlddata.skills[id].GetRequirements().Done() == 2) visibility_headers["category_skill_"+worlddata.skills[id].GetCategory()] += 1;
        }
    }
    for (let id in worlddata.items) {
        if (worlddata.items[id].GetRequirements()) {
            visibility_listings.push({id: id, visible: worlddata.items[id].GetRequirements().Done(), req_text: worlddata.items[id].GetRequirements().Text()});
        
            if (!visibility_headers["category_item_"+worlddata.items[id].GetCategory()]) {
                visibility_headers["category_item_"+worlddata.items[id].GetCategory()] = 0;
            }
            if (worlddata.items[id].GetRequirements().Done() == 2) visibility_headers["category_item_"+worlddata.items[id].GetCategory()] += 1;
        }
    }

    for (let i in visibility_listings) {
        let id = visibility_listings[i].id;

        if (visibility_listings[i].visible == 1) {
            document.getElementById(id+"_req_text").style.visibility = "visible";
            document.getElementById(id+"_req_text").style.display = "";
            document.getElementById(id+"_req_text").innerHTML = visibility_listings[i].req_text;
        }
        else {
            document.getElementById(id+"_req_text").style.visibility = "hidden";
            document.getElementById(id+"_req_text").style.display = "none";
        }

        if (visibility_listings[i].visible < 2) {
            document.getElementById(id+"_listing").style.visibility = "hidden";
            document.getElementById(id+"_listing").style.display = "none";
        }
        else {
            document.getElementById(id+"_listing").style.visibility = "visible";
            document.getElementById(id+"_listing").style.display = "";
        }
    }
    for (let header_id in visibility_headers) {
        if (visibility_headers[header_id] > 0) {
            document.getElementById(header_id).style.visibility = "visible";
            document.getElementById(header_id).style.display = "";
        }
        else {
            document.getElementById(header_id).style.visibility = "hidden";
            document.getElementById(header_id).style.display = "none";
        }
    }
}

var UpdateUI_PlayerInfo = function() {
    document.getElementById("player_age").innerHTML = Time.format(playerdata.resources.time);

    document.getElementById("player_money").innerHTML = Currency(playerdata.resources.money);

    let income = worlddata.jobs[playerdata.active.job].Income();
    let expenses = 0;
    for (let id in worlddata.items) {
        expenses -= worlddata.items[id].Cost();
    }
    document.getElementById("player_net_money").innerHTML = Currency(income + expenses);
    document.getElementById("player_income").innerHTML = Currency(income);
    document.getElementById("player_expenses").innerHTML = Currency(expenses);

    document.getElementById("player_happiness").innerHTML = Places(playerdata.skill_effects["qol_all"], 2);

    document.getElementById("player_time_speed").innerHTML = Places(playerdata.skill_effects["time_speed"], 2);
}

//////////////////
// Utility functions

var Scaling = function (scalings, power) {
    let current_mult = 1
    for (let i in scalings) {
        let scaling_power = power;
        if (scalings[i].softcap) {
            if (power > scalings[i].softcap.start) {
                scaling_power = scalings[i].softcap.start + ((power - scalings[i].softcap.start) ** scalings[i].softcap.strength)
            }
        }
        switch(scalings[i].type) {
            case "linear":
                current_mult *= (1+(scalings[i].degree*scaling_power))
                break;
            case "exp":
                current_mult *= ((1+scalings[i].degree) ** scaling_power)
                break;
            case "falloff":
                current_mult *= Log(scaling_power + 1, 1 + (1/scalings[i].degree)) + 1
                break;
            case "log":
                current_mult *= Log(scaling_power + 1, scalings[i].degree) + 1
                break;
            default:
                console.log("ERROR: invalid scaling type SCALING."+scalings[i].type.toUpperCase());
                break;
        }
    }
    return current_mult;
}
window.Scaling = Scaling;

var Log = function (value, base) {
    return Math.log(value) / Math.log(base);
}

var Currency = function (value, places = 2) { // returns innerHTML for display usage
    return Currencies.format(value, places);
}
window.Currency = Currency;

var Places = function (value, places=2, threshold=3) {
    if (value < (10 ** threshold)) {
        value *= (10 ** places);
        value = Math.trunc(value);
        value /= (10 ** places);
        return value;
    }
    else {
        switch(number_display_mode) {
            case "standard":
                value = StandardNotation.format(value, 1);
                break;
            case "e":
                let e_mag = Math.floor(Math.log10(value));
                value /= (10 ** (e_mag-2));
                value = (Math.trunc(value)/100)+"e+"+e_mag;
                break;
            default:
                value = Math.trunc(value);
                break;
        }
        return value;
    }
}
window.Places = Places;

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
window.addCSSClass = addCSSClass;
window.removeCSSClass = removeCSSClass;
//////////////////////// THIS SNIPPET FROM THE INTERNET
async function fromFile(filename) {
    const response = await fetch(filename);
    return response.text();
}
//////////////////////// END THIS SNIPPET FROM THE INTERNET