// bg audio loop
var audio = new Audio('chill1.mp3');
var bgvolume = 0;
audio.volume = bgvolume;

var ToggleAudio = function () {
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
}

var AdjustMusic = function () {
    bgvolume = bgvolume + 0.2;
    if (bgvolume > 1) bgvolume = 0;
    audio.volume = bgvolume;
}

setInterval(function () {
    if (audio.ended) {
        audio = new Audio('chill'+(Math.floor(1+(4*Math.random())))+'.mp3');
        audio.volume = bgvolume;
        audio.play();
    }
}, 5000);