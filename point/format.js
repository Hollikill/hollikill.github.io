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

// from https://www.webtips.dev/webtips/javascript/how-to-clamp-numbers-in-javascript
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);