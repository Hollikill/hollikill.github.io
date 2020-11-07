if (getCookie("style") != "light" && getCookie("style") != "dark") {
    swapStyleSheet("css/light.css")
    document.cookie = "style=light";
}
else {
    swapStyleSheet("css/"+getCookie("style")+".css")
}

function switchStyle() {
    if (getCookie("style") == "light") {
        document.cookie = "style=dark";
        swapStyleSheet("css/"+getCookie("style")+".css")
    }
    else if (getCookie("style") == "dark"){
        document.cookie = "style=light";
        swapStyleSheet("css/"+getCookie("style")+".css")
    }
    else {
        swapStyleSheet("css/light.css")
    }
}

//functions from the w3 website
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
}


//from user https://stackoverflow.com/users/1851972/benji in post https://stackoverflow.com/questions/14292997/changing-style-sheet-javascript
function swapStyleSheet(sheet) {
    document.getElementById("pagestyle").setAttribute("href", sheet);  
}