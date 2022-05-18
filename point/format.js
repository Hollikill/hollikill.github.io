// from https://kastark.co.uk/articles/incrementals-part-2.html
function prettify(input){
    var output = Math.round(input * 1000000)/1000000;
	return output;
}

function ChangeNumber(id, num, format) {
    if (format == 2)
        document.getElementById(id).textContent = (num.mantissa*Math.pow(10, num.exponent)).toFixed(2);
    else if (format == 1)
        document.getElementById(id).textContent = (num.mantissa*Math.pow(10, num.exponent)).toFixed(0);
    else {
        if (num.exponent < 2)
            document.getElementById(id).textContent = (num.mantissa*Math.pow(10, num.exponent)).toFixed(0);
        else
            document.getElementById(id).textContent = num.mantissa.toFixed(2)+"e"+num.exponent;
    }
}

function clamp (innum, min, max) {
    var num = innum;
    if (num > max) {
        num = max;
    }
    else if (num < min) {
        num = min;
    }
    return num;
}

function modulo (innumber, limit) {
    var number = innumber;
    var times = number.abs().div(limit).floor();
    if (number.compare(limit) >= 0) {
        number = number.plus(limit.neg().times(times));
    }
    else if (number.compare(0) < 0) {
        number = number.plus(limit.times(times.plus(1)));
    }
    return number;
}