var boardspace = []
var boardx = 0;
var boardy = 0;

document.addEventListener('keydown', function(event) {
    switch (event.key) {
        case "ArrowLeft":
            Slide("left");
            break;
        case "ArrowRight":
            Slide("right");
            break;
        case "ArrowUp":
            Slide("up");
            break;
        case "ArrowDown":
            Slide("down");
            break;
    }
});

function MakeBoard (x, y) {
    for (let xi = 0; xi < x; xi++) {
        var colElem = document.createElement("div");
        colElem.classList.add("col");

        var col = [];

        for (let yi = 0; yi < y; yi++) {

            var tile = 0;
            col.push(tile);

            var tileElem = document.createElement("p");
            tileElem.classList.add("tile");
            tileElem.textContent = tile;
            colElem.append(tileElem);

        }

        boardspace.push(col);

        document.getElementById("board").append(colElem);
    }

    boardx = x;
    boardy = y;
}

function Slide (dir) {
    var deltax = 0;
    var deltay = 0;

    switch (dir) {
        case "left":
            deltax = -1;
            break;
        case "right":
            deltax = 1;
            break;
        case "up":
            deltay = -1;
            break;
        case "down":
            deltay = 1;
            break;
    }

    if (deltax < 1 && deltay < 1) {
        for (let xi = 0; xi < boardx; xi++) {
            for (let yi = 0; yi < boardy; yi++) {
                var tdeltax = deltax;
                var tdeltay = deltay;
                var tile = boardspace[xi][yi];
                if (tile != 0 && -1 < xi+tdeltax && xi+tdeltax < boardx && -1 < yi+tdeltay && yi+tdeltay < boardy) {
                    if (boardspace[xi+tdeltax][yi+tdeltay] == tile && -1 < xi+tdeltax && xi+tdeltax < boardx && -1 < yi+tdeltay && yi+tdeltay < boardy) {
                        boardspace[xi+tdeltax][yi+tdeltay] = tile*2;
                        boardspace[xi+tdeltax-deltax][yi+tdeltay-deltay] = 0;
                    }
                    while (boardspace[xi+tdeltax][yi+tdeltay] == 0 && -1 < xi+tdeltax && xi+tdeltax < boardx && -1 < yi+tdeltay && yi+tdeltay < boardy) {
                        boardspace[xi+tdeltax][yi+tdeltay] = tile;
                        boardspace[xi+tdeltax-deltax][yi+tdeltay-deltay] = 0;
                        tdeltax = tdeltax + deltax;
                        tdeltay = tdeltay + deltay;
                    }
                }
            }
        }
    }
    else {
        for (let xi = boardx-1; xi > -1; xi--) {
            for (let yi = boardy-1; yi > -1; yi--) {
                var tdeltax = deltax;
                var tdeltay = deltay;
                var tile = boardspace[xi][yi];
                if (tile != 0 && -1 < xi+tdeltax && xi+tdeltax < boardx && -1 < yi+tdeltay && yi+tdeltay < boardy) {
                    if (boardspace[xi+tdeltax][yi+tdeltay] == tile && -1 < xi+tdeltax && xi+tdeltax < boardx && -1 < yi+tdeltay && yi+tdeltay < boardy) {
                        boardspace[xi+tdeltax][yi+tdeltay] = tile*2;
                        boardspace[xi+tdeltax-deltax][yi+tdeltay-deltay] = 0;
                    }
                    while (boardspace[xi+tdeltax][yi+tdeltay] == 0 && -1 < xi+tdeltax && xi+tdeltax < boardx && -1 < yi+tdeltay && yi+tdeltay < boardy) {
                        boardspace[xi+tdeltax][yi+tdeltay] = tile;
                        boardspace[xi+tdeltax-deltax][yi+tdeltay-deltay] = 0;
                        tdeltax = tdeltax + deltax;
                        tdeltay = tdeltay + deltay;
                    }
                }
            }
        }
    }

    GenStep();
    UpdateBoard();
}

function GenStep () {
    var looping = true;
    var i = 0;
    while (looping) {
        var x = Math.floor(Math.random()*boardx);
        var y = Math.floor(Math.random()*boardy);
        if (boardspace[x][y] == "0") {
            var tospawn = 2;
            var isFour = Math.random()*10;
            if (isFour < 1) {
                tospawn = 4;
            }
            boardspace[x][y] = tospawn;
            looping = false;
        }
        i = i +1;
        if (i > 500) {
            looping = false;
        }
    }
}

function UpdateBoard () {
    var board = document.getElementById("board");
    for (let xi = 0; xi < boardx; xi++) {
        var col = board.children[xi];
        for (let yi = 0; yi < boardy; yi++) {
            var tile = col.children[yi];
            tile.textContent = boardspace[xi][yi];
            tile.style.backgroundColor = "rgb("+((Math.log2(tile.textContent+0.0001)*255/3)%255)+", "+((Math.log2(tile.textContent+0.0001)*255/8)%255)+", 0)";
        }
    }
}

$(function () {
    MakeBoard(4,4);
    GenStep();
    GenStep();
    UpdateBoard();
});