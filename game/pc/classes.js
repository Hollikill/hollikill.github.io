export class Units {
    constructor() {
        // nothing yet
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

            if (Math.max(carried_value,0) >= cur_magnitude && (0 != Math.trunc(carried_value/cur_magnitude) || (this.units.length -1 -i == 0) && used_places == display_places)) {
                used_places -= 1;
                switch (this.display_mode) {
                    case "post":
                        symbol_text.push("<span style=\"color:"+cur_symbol.color+"\">"+Math.trunc(carried_value/cur_magnitude)+cur_symbol.symbol+"</span>")
                        break;
                    case "pre_unstyled":
                        symbol_text.push(cur_symbol.symbol+" "+"<span style=\"color:"+cur_symbol.color+"\">"+Math.trunc(carried_value/cur_magnitude)+"</span>")
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