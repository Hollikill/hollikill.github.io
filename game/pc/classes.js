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
                    if (!(playerdata.jobs[this.requirements[i].name])) break;
                    value = playerdata.jobs[this.requirements[i].name].level;
                    if (value <= this.requirements[i].magnitude*this.threshold) completion = 0;
                    else if (value < this.requirements[i].magnitude && completion >= 1) completion = 1;
                    if (value >= this.requirements[i].magnitude) this.requirements[i].done = true;

                    break;
                case "skill":
                    if (!(playerdata.skills[this.requirements[i].name])) break;
                    value = playerdata.skills[this.requirements[i].name].level;
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
                    if (!(playerdata.jobs[this.requirements[i].name])) break;
                    value = playerdata.jobs[this.requirements[i].name].level;
                    req_texts.push(this.requirements[i].name.toUpperCase() + " " + playerdata.jobs[this.requirements[i].name].level + "/" + this.requirements[i].magnitude);

                    break;
                case "skill":
                    if (!(playerdata.skills[this.requirements[i].name])) break;
                    value = playerdata.skills[this.requirements[i].name].level;
                    req_texts.push(this.requirements[i].name.toUpperCase() + " " + playerdata.skills[this.requirements[i].name].level + "/" + this.requirements[i].magnitude);
                    
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
}