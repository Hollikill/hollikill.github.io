export class Units {
    constructor() {
        this.units = []
        this.display_mode = "post"
    }

    setDisplayMode = function (display_mode) {
        this.display_mode = display_mode;
    }

    insertSymbol = function (position, symbol, size, color="#fff") {
        let newSymbol = {
            symbol: symbol,
            color: color,
            size: size,
        }
        if (position <= this.units.length) {
            this.units.splice(position, 0, newSymbol);
            return true;
        }
        else {
            return false;
        }
    }

    appendSymbol = function (symbol, size, color="#fff") {
        return this.insertSymbol(this.units.length, symbol, size, color);
    }

    // returns innerHTML for display usage
    format = function (value, display_places = 2) {
        if (this.units.length == 0) return value;

        let is_negative = false;
        if (value < 0) is_negative = true;
        
        let used_places = display_places;
        let carried_value = Math.abs(value);
        let symbol_text = [];

        // check the correct denominations
        let cur_magnitude = 1
        for (let i in this.units) {
            cur_magnitude *= this.units[i].size
        }
        for (let i in this.units) {
            if (used_places <= 0) break;

            let cur_symbol = this.units[this.units.length -1 -i]; // loop in opposite direction
            cur_magnitude /= cur_symbol.size;
            //console.log(cur_magnitude)

            if (Math.max(carried_value,0) >= cur_magnitude && 0 != Math.trunc(carried_value/cur_magnitude) || ((this.units.length -1 -i == 0) && used_places == display_places)) {
                used_places -= 1;
                switch (this.display_mode) {
                    case "post":
                        symbol_text.push("<span style=\"color:"+cur_symbol.color+"\">"+Math.trunc(carried_value/cur_magnitude)+cur_symbol.symbol+"</span>")
                        break;
                    case "pre_unstyled":
                        symbol_text.push(cur_symbol.symbol+" "+"<span style=\"color:"+cur_symbol.color+"\">"+Math.trunc(carried_value/cur_magnitude)+"</span>")
                        break;
                    case "post_d2":
                        symbol_text.push("<span style=\"color:"+cur_symbol.color+"\">"+(Math.trunc((carried_value*100)/cur_magnitude)/100)+cur_symbol.symbol+"</span>")
                        break;
                    default:
                        symbol_text.push(""+Math.trunc(carried_value/cur_magnitude))
                        break;
                }
            }

            carried_value = (carried_value%cur_magnitude)
        }

        symbol_text = symbol_text.join(" ")

        if (is_negative) symbol_text = '-' + symbol_text;

        // construct the HTML
        return symbol_text;
    }
}

const RequirementTypes = [
    "job",
    "skill",
    "money",
]

export class Requirements {
    constructor(threshold = 0.1) {
        this.requirements = []
        this.threshold = Math.min(1, Math.max(0, threshold))
    }

    Done() {
        let completion = 2;
        for (let i in this.requirements) {
            if (this.requirements[i].done == true) continue;
            let value = 0;
            switch(this.requirements[i].type) {
                case "job":
                    if (!(worlddata.jobs[this.requirements[i].name])) break;
                    value = worlddata.jobs[this.requirements[i].name].instance.level;
                    if (value <= this.requirements[i].magnitude*this.threshold) completion = 0;
                    else if (value < this.requirements[i].magnitude && completion >= 1) completion = 1;
                    if (value >= this.requirements[i].magnitude) this.requirements[i].done = true;

                    break;
                case "skill":
                    if (!(worlddata.skills[this.requirements[i].name])) break;
                    value = worlddata.skills[this.requirements[i].name].instance.level;
                    if (value <= this.requirements[i].magnitude*this.threshold) completion = 0;
                    else if (value < this.requirements[i].magnitude && completion >= 1) completion = 1;
                    if (value >= this.requirements[i].magnitude) this.requirements[i].done = true;
                    
                    break;
                case "money":
                    value = playerdata.resources.money;
                    if (value <= this.requirements[i].magnitude*this.threshold) completion = 0;
                    else if (value < this.requirements[i].magnitude && completion >= 1) completion = 1;
                    if (value >= this.requirements[i].magnitude) this.requirements[i].done = true;
                    
                    break;
                case "default":
                    console.log("ERROR: invalid requirement type REQ."+type.toUpperCase());
                    break;
            }
        }
        return completion;
    }

    Text() {
        let req_texts = [];
        for (let i in this.requirements) {
            if (this.requirements[i].done == true) continue;
            let value = 0;
            switch(this.requirements[i].type) {
                case "job":
                    if (!(worlddata.jobs[this.requirements[i].name])) break;
                    value = worlddata.jobs[this.requirements[i].name].instance.level;
                    req_texts.push(this.requirements[i].name.toUpperCase() + " " + worlddata.jobs[this.requirements[i].name].instance.level + "/" + this.requirements[i].magnitude);

                    break;
                case "skill":
                    if (!(worlddata.skills[this.requirements[i].name])) break;
                    value = worlddata.skills[this.requirements[i].name].instance.level;
                    req_texts.push(this.requirements[i].name.toUpperCase() + " " + worlddata.skills[this.requirements[i].name].instance.level + "/" + this.requirements[i].magnitude);
                    
                    break;
                case "money":
                    value = playerdata.resources.money;
                    req_texts.push(Currency(playerdata.resources.money) + "/" + Currency(this.requirements[i].magnitude));
                    
                    break;
                case "default":
                    console.log("ERROR: invalid requirement type REQ."+type.toUpperCase());
                    break;
            }
        }
        return "Required: "+ req_texts.join(", ");
    }

    Reset() {
        for (let i in this.requirements) {
            this.requirements[i].done = false;
        }
    }

    Add(type, magnitude, name="") {
        if (RequirementTypes.includes(type)) {
            this.requirements.push({type: type, magnitude:magnitude, name:name, done:false});
        }
        else {
            console.log("ERROR: invalid requirement type REQ."+type.toUpperCase());
        }
        return this;
    }

    SetThreshold(threshold) {
        this.threshold = threshold;
    }
}

export class Listable {
    constructor(name, category) {
        this.name = name;
        this.category = category;
        this.multipliers = {};
        this.multipliers_conditions = {};
        this.valid_multiplier_types = [];
        this.instance = {};
    }
    
    AddMultiplier(type, multiplier_id, conditions={}) {
        if (this.valid_multiplier_types.includes(type)) {
            if (!this.multipliers[type]) this.multipliers[type] = [];
            if (!this.multipliers[type].includes(multiplier_id)) this.multipliers[type].push({id: multiplier_id, conditions: conditions});
        }
        else {
            console.log("ERROR: invalid multiplier type MULT."+type);
            return false;
        }
    }

    GetMultiplier(type) {
        let total_multiplier = 1;
        if (this.multipliers[type]) {
            for (let i in this.multipliers[type]) {
                if (this.multipliers[type][i].conditions.category) if (this.category != this.multipliers[type][i].conditions.category) continue;
                if (this.multipliers[type][i].conditions.name) if (this.name != this.multipliers[type][i].conditions.name) continue;
                total_multiplier *= playerdata.skill_effects[this.multipliers[type][i].id];
            }
        }
        else {
            return 1;
        }
        return total_multiplier;
    }

    GetRequirements() {
        if (!this.requirements) {
            this.requirements = new Requirements();
        }
        return this.requirements;
    }

    GetCategory() { return this.category; }
    SetCategory(category) { this.category = category; }
}

export class Levelable extends Listable {
    constructor(name, category, xp_base, xp_scaling=[{type: "exp", degree:0.01},{type: "linear", degree:1},]) {
        super(name, category);

        this.xp = {
            base : xp_base,
            scaling : xp_scaling,
        }
        this.active = false;

        this.valid_multiplier_types.push("xp");
        this.valid_multiplier_types.push("xp_inactive");

        this.instance["xp"] = 0;
        this.instance["level"] = 0;
    }

    Tick(days_passed) {
        let active_multiplier = 1;
        if (!this.active) {
            if (this.instance["level"] > 0) active_multiplier = Math.min(Math.max((this.GetMultiplier("xp_inactive") - 1) * (0.65 ** Math.log2(this.instance["level"])), 0), 1);
            else active_multiplier = 0;
        }

        this.instance["xp"] += days_passed * gain_base_xp * this.GetMultiplier("xp") * active_multiplier;

        // process any level ups
        let xp_max = this.xp["base"] * Scaling(this.xp["scaling"], this.instance["level"]);
        while (this.instance["xp"] >= xp_max) {
            this.instance["xp"] -= xp_max;
            this.instance["level"] += 1;
            xp_max = this.xp["base"] * Scaling(this.xp["scaling"], this.instance["level"]);
        }
    }

    UpdateUI() {
        let active_multiplier = 1;
        if (!this.active) {
            if (this.instance["level"] > 0) active_multiplier = Math.min(Math.max((this.GetMultiplier("xp_inactive") - 1) * (0.65 ** Math.log2(this.instance["level"])), 0), 1);
            else active_multiplier = 0;
        }

        document.getElementById(this.name + "_level").innerHTML = this.instance["level"];
        document.getElementById(this.name + "_xp_day").innerHTML = Places(gain_base_xp * this.GetMultiplier("xp") * active_multiplier, 1);
        document.getElementById(this.name + "_xp_left").innerHTML = Places((this.xp["base"] * Scaling(this.xp["scaling"], this.instance["level"])) - this.instance["xp"], 0);

        // update progress bar
        let progress_bar = document.getElementById(this.name+"_listing").getElementsByTagName("button")[0].getElementsByTagName("progress")[0];
        progress_bar.max = this.xp["base"] * Scaling(this.xp["scaling"], this.instance["level"]);
        progress_bar.value = this.instance["xp"];
    }
}

export class Job extends Levelable {
    constructor(name, category, xp_base, earn_base, xp_scaling=[{type: "exp", degree:0.01},{type: "linear", degree:1},], earn_scaling = [{type: "log", degree:10},]) {
        super(name, category, xp_base, xp_scaling);

        this.earn = {
            base : earn_base,
            scaling : earn_scaling,
        }
        //this.type = "job";

        this.valid_multiplier_types.push("earn");
    }

    SetActive() {
        if (this.name != playerdata.active.job) {
            if (document.getElementById(playerdata.active.job+"_listing")) removeCSSClass(document.getElementById(playerdata.active.job+"_listing"), "active_job_listing"); // remove old active job css class
            addCSSClass(document.getElementById(this.name+"_listing"), "active_job_listing");
            playerdata.active.job = this.name;
        }
    }

    Tick(days_passed) {
        this.active = (this.name == playerdata.active.job);
        super.Tick(days_passed);

        if (this.active) {
            playerdata.resources["money"] += days_passed * this.Income();
        }
    }

    UpdateUI() {
        super.UpdateUI();

        document.getElementById(this.name + "_earn").innerHTML = Currency(this.Income());
    }

    Income() {
        return (this.earn["base"] * Scaling(this.earn["scaling"], this.instance["level"])) * this.GetMultiplier("earn");
    }
}

export class Skill extends Levelable {
    constructor(name, category, xp_base, components, xp_scaling=[{type: "exp", degree:0.01},{type: "linear", degree:1},]) {
        super(name, category, xp_base, xp_scaling);

        this.components = components;
    }

    SetActive() {
        if (this.name != playerdata.active.skill) {
            if (document.getElementById(playerdata.active.skill+"_listing"))  removeCSSClass(document.getElementById(playerdata.active.skill+"_listing"), "active_skill_listing");
            addCSSClass(document.getElementById(this.name+"_listing"), "active_skill_listing");
            playerdata.active.skill = this.name;
        }
    }

    Tick(days_passed) {
        this.active = (this.name == playerdata.active.skill);
        super.Tick(days_passed);
    }

    UpdateUI() {
        super.UpdateUI();

        document.getElementById(this.name + "_effect").innerHTML = "+"+ Places(this.components[0].part * this.instance["level"], 0) + " " + this.components[0].class + ":" + this.components[0].skill;
    }

    Effects() {
        let effects = [];
        for (let i in this.components) {
            effects.push({skill : this.components[i].skill, value : this.components[i].part * this.instance["level"], class : this.components[i].class})
        }
        return effects;
    }
}

export class Buyable extends Listable {
    constructor(name, cost, components) {
        super(name, "misc");

        this.cost = cost;
        this.components = components;

        this.valid_multiplier_types.push("cost");

        this.instance["enabled"] = false;
        this.instance["last_selected"] = Date.now();

        this.GetRequirements().Add("money", cost*100);
    }

    SetSingleton(singleton_id) {
        this.singleton_id = singleton_id;
        this.category = singleton_id;
    }
    GetSingleton() {
        if (this.singleton_id) { return this.singleton_id; }
        else { return undefined; }
    }

    Tick(days_passed) {
        if (playerdata.resources["money"] <= days_passed * (this.cost * this.GetMultiplier("cost")) && this.instance["enabled"]) this.SetActive(true);
        if (this.instance["enabled"]) {
            playerdata.resources.money -= days_passed * (this.cost * this.GetMultiplier("cost"))
        }
    }

    Cost() {
        let is_enabled = 0;
        if (this.instance["enabled"]) is_enabled = 1;
        return (this.cost * this.GetMultiplier("cost")) * is_enabled;
    }

    UpdateUI() {
        document.getElementById(this.name + "_cost").innerHTML = Currency(this.cost * this.GetMultiplier("cost"));
        document.getElementById(this.name + "_effect").innerHTML = "x"+ Places(this.components[0].part, 2) + " " + this.components[0].skill;
    }

    Effects() {
        let effects = [];
        for (let i in this.components) {
            let effect_value = this.components[i].part;
            if (!this.instance["enabled"]) effect_value = 1;
            effects.push({skill : this.components[i].skill, value : effect_value, class : this.components[i].class})
        }
        return effects;
    }

    SetActive(flag_disable = false) {
        if (this.instance["enabled"] == true || flag_disable) {
            removeCSSClass(document.getElementById(this.name+"_listing"), "active_item_listing");
            this.instance["enabled"] = false;
        }
        else {
            this.instance["last_selected"] = Date.now();
            addCSSClass(document.getElementById(this.name+"_listing"), "active_item_listing");
            this.instance["enabled"] = true;
        }
    }

    GetActive() { return this.instance["enabled"]; }

    CompareSingletonPriority(buyable_other) {
        return (this.instance["last_selected"] >= buyable_other.instance["last_selected"] || this.name == buyable_other.name);
    }
}