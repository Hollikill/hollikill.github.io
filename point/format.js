// from https://kastark.co.uk/articles/incrementals-part-2.html
function prettify(input){
    var output = Math.round(input * 1000000)/1000000;
	return output;
}

function ChangeNumber(id, num) {
    document.getElementById(id).textContent = num.mantissa.toFixed(2)+"e"+num.exponent;
}