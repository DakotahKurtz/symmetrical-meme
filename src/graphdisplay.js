class LongPressHandler {

    static SHORTEST_TIMEOUT = 50;

    constructor(clickable, callback, fireRateFx) {
        this.target = clickable;
        this.callback = callback;
        this.isHeld = false;
        this.activeHoldTimeoutId = null;
        this.fireRateFx = fireRateFx;
        this.defaultFireRate = 1000;
        this.currentFireRate = this.defaultFireRate;
        this.change = 1;


        ["mousedown", "touchstart"].forEach(type => {
            this.target.addEventListener(type, this.onTouch.bind(this));
        });

        ["mouseup", "mouseleave", "mouseout", "touchend", "touchcancel"].forEach(type => {
            this.target.addEventListener(type, this.onRelease.bind(this));
        });

        
    }



    onTouch() {
        this.isHeld = true;
            this.callback(this.change);
            this.activeHoldTimeoutId = this.fireCallback();
        
    }

    fireCallback() {
        let x = setTimeout(() => {
            if (this.isHeld) {
                this.callback(this.change);
                this.currentFireRate = this.fireRateFx(this.currentFireRate);

                if (this.currentFireRate == LongPressHandler.SHORTEST_TIMEOUT) {
                    this.change = Math.min(this.change + 1, 10);
                }
                return this.fireCallback();
            } else {
                return;
            }
        }, this.currentFireRate);
    }

    onRelease() {
        this.isHeld = false;
        this.currentFireRate = this.defaultFireRate;
        this.change = 1;
        clearTimeout(this.activeHoldTimeoutId);
    }

    static identity(x) {
        return x;
    }

    static linear(x) {
        return Math.max(x * .7, LongPressHandler.SHORTEST_TIMEOUT);
    }

    
} 
 
 const dirty_creme = "245 244 228";
 const red = "250 112 112";
 const creme = "254 253 237";
 const blackish = "54 53 55";
 const offBlackish = "71 91 90";
 const light_green = "198 235 197";
 const dark_green = "161 195 152";
 const darker_green = "68 106 90";
 const nice_blue = "63 124 172";
 const artificial_blue = "64 107 173";
 const whiter_white = "246 253 250";

const canvas = document.getElementById("graph-display");
const ctx = canvas.getContext("2d");
const bgColor = creme;
const graphIncrementLineColor = offBlackish;

let termsLabel = document.getElementById("graph-N-label");

let width, height;
let N = 1;

window.addEventListener("load", loadListener);
window.addEventListener("resize", () => {scaleCanvas(); drawGraph();});

new LongPressHandler(document.getElementById("minus-n"), minusNClickListener, (x) => {return Math.max(x * .7, 30)});
new LongPressHandler(document.getElementById("plus-n"), plusNClickListener, (x) => {return Math.max(x * .7, 30)});
// document.getElementById("minus-n").addEventListener("click", minusNClickListener);
// document.getElementById("plus-n").addEventListener("click", plusNClickListener);

function minusNClickListener() {
    if (N > 1) {
        N--;
        drawGraph();
    }

}

function plusNClickListener() {
    N++;
    drawGraph();
}


function drawGraph() {
    let termsLabel = document.getElementById("graph-N-label");
    termsLabel.innerText= "" + N + " term approximation";
    let realValues = [];
    let approximation = [];

    let xMin, yMin, xMax, yMax, xAxis, yAxis;
    xMin = -1;
    xMax = 5;
    yMin = -3;
    yMax = 2;

    xAxis = -xMin;
    yAxis = yMax;

    let xRange, yRange, scaleX, scaleY, yMid, xMid;
    xRange = (xMax - xMin);
    yRange = (yMax - yMin);

    scaleX = width / (xRange);
    scaleY = height / (yRange);
    yMid = Math.ceil(yRange / 2);
    xMid = Math.ceil(xRange / 2);

    ctx.fillStyle = "rgb(" + bgColor + ")";
    ctx.fillRect(0, 0, width, height);
    // draw vertical grid lines
    ctx.strokeStyle = "rgb(" + graphIncrementLineColor + " / 30%)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.save();

    for (let i = 1; i <= xRange; i++) {
        if (i == xAxis) {
            ctx.strokeStyle = "rgb(" + red + ")";
            ctx.setLineDash([]);
            ctx.lineWidth = 2;
        } else if (i - 1 == xAxis) {
            ctx.restore();
            ctx.save();
        }
        ctx.beginPath();
        ctx.moveTo(i * scaleX, 0);
        ctx.lineTo(i * scaleX, height);
        ctx.stroke();
    }

    // draw horizontal lines

    for (let i = 1; i <= yRange; i++) {
        if (i == yAxis) {
            ctx.strokeStyle = "rgb(" + red + ")";
            ctx.setLineDash([]);
            ctx.lineWidth = 2;
        } else if ((i - 1) == yAxis) {
            ctx.restore();
        }
        ctx.beginPath();
        ctx.moveTo(0, i * scaleY);
        ctx.lineTo(width, i * scaleY);
        ctx.stroke();
    }


    // draw squareWave
    let increment = .01;
    let L = 2;
    let x, y, drawX, drawY, tx, ty;
    // tx = (xMid + xMin) * -scaleX;
    // ty = (yMid + yMin) * -scaleY;
    tx = (xAxis * scaleX) - (width / 2);
    ty = (yAxis * scaleY) - (height / 2);
    x = xMin;
    y = squareWave(x, L);

    ctx.strokeStyle = "black";
    ctx.setLineDash([]);
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(coordsToDrawX(x * scaleX) + tx, coordsToDrawY(y * scaleY) + ty);
    x += increment;
    for (; x <= xMax; x += increment) {

        y = squareWave(x, L);
        drawX = coordsToDrawX(x * scaleX) + tx;
        drawY = coordsToDrawY(y * scaleY) + ty;
        ctx.lineTo(drawX, drawY);

        if (x >= 0 && x <= L) {
            realValues.push([x, y]);
        }
    }
    ctx.stroke();

    // calculate approximation


    // draw approximation
    x = xMin;
    y = totalApproximation(x, L);
    ctx.strokeStyle = "green";
    ctx.beginPath();
    ctx.moveTo(coordsToDrawX(x * scaleX) + tx, coordsToDrawY(y * scaleY) + ty);
    x += increment;
    for (;x <= xMax; x += increment) {
        y = totalApproximation(x, L);
        drawX = coordsToDrawX(x * scaleX) + tx;
        drawY = coordsToDrawY(y * scaleY) + ty;
        ctx.lineTo(drawX, drawY);

        if (x >= 0 && x <= L) {
            approximation.push([x, y]);
        }
    }
    ctx.stroke();

    // let x1 = .5;
    // let y1 = approximateVector(x1, 1, L);
    // let y2 = approximateVector(x1, 3, L);
    // let r1 = totalApproximation(x1, L);
    // console.log(N + " | " + y1 + ", " + y2 + ": " + r1 )


    // draw individual sin waves
    let primaryTransparency = 30;
    let bgTransparency = 20;
    ctx.setLineDash([2, 2]);
    for (let i = 0; i < N; i++) {
        x = xMin;
        y = approximateVector(x, (i * 2) + 1, L);

        if ((i + 1) == N) {
            ctx.strokeStyle = getColor(i, primaryTransparency);
            ctx.setLineDash([]);
        } else {
            ctx.strokeStyle = getColor(i, bgTransparency);
        }
        ctx.beginPath();
        ctx.moveTo(coordsToDrawX(x * scaleX) + tx, coordsToDrawY(y * scaleY) + ty);
        x += increment;
        for (; x <= xMax; x += increment) {
            y = approximateVector(x, (i * 2) + 1, L);
            drawX = coordsToDrawX(x * scaleX) + tx;
            drawY = coordsToDrawY(y * scaleY) + ty;
            ctx.lineTo(drawX, drawY);
        }
        ctx.stroke();
    }

    // estimate error
    let error = 0;
    for (let i = 0; i < realValues.length; i++) {
        error += distance(realValues[i][0], realValues[i][1], approximation[i][0], approximation[i][1]);
    }
    error /= (realValues.length);
    console.log("ERROR: " + error);

    // string
    
    let approxString = "4/π * (";
    let n, measureText;
    for (let i = 0; i < N; i++) {
        n = (i * 2) + 1;
        approxString += "(1/" + n + ") * sin( (" + n +"πx)/ " + L + " )";

        if (i + 1 != N) {
            approxString += " + ";
        } 
        measureText = ctx.measureText(approxString);
        if (measureText.width > width * .6 && (i + 1) < N) {
            n = ((N - 1) * 2) + 1;
            approxString += " ... + (1/" + n + ") * sin( (" + n +"πx)/ " + L + " )"
            break;
        }
    }
    approxString += " )";


    ctx.fillStyle = "black";
    ctx.fillText(approxString, width * .05, height * .8);
}



function distance(x1, y1, x2, y2) {
    return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
}

function getColor(i, transparency) {
    // let r = (i) => {
    //     if (i > 20) {
    //         return (i * 10) + 100;
    //     } else {
    //         return 100;
    //     }
    // };
    // let g = (28 + i * 10) % 255;
    // let b = (i) => {
    //     if (i < 10) {
    //         return 252;
    //     } else {
            // return Math.abs((255 - i * 10));
    //     }
    // };
    // console.log(i + " | r,g,b: " + r + ", " + g + ", " + b(i));
    let r = (i) => {
        let round = i % 10;
        if (i < 15) {
            return 100;
        } else {
            return 100 + round * 15;
        }
    }

    let g = (i) => {
        let round = i % 20;
        return 28 + round * 10;
    }

    let b = (i) => {
        if (i < 10) {
            return 252 - (i * 5);
        } else {
            return Math.abs((255 - i * 10));
        }
    }

    // console.log(i + " | rgb: " + r(i) + ", " + g(i) + ", " + b(i));
    return "rgb(" + r(i) + " " + g(i) + " " + b(i) + "/" + (transparency) + "%)";
}

function totalApproximation(x, L) {
    let v = 0;
    for (let i = 0; i < N; i++) {
        v += approximateVector(x, (i * 2) + 1, L);
    }
    return v;
} 

function approximateVector(x, n, L) {
    return (4 / Math.PI) * (1 / n) * Math.sin((n * Math.PI * x) / L);
}

function squareWave(x, L) {
    return (4 * Math.floor(x / (2 * L))) - (2 * Math.floor((2 * x) / (2 * L))) + 1;
}

function heaviside(x) {
    if (x < 0) {
        return 0;
    } else if (x == 0) {
        return .5;
    } else {
        return 1;
    }
}

function coordsToDrawX(x) {
    return (x + (width / 2 ));
            
}
    
function coordsToDrawY(y) {
    return ((height / 2) - y);
}

function loadListener() {
    scaleCanvas();
    drawGraph();
}

function scaleCanvas() {
    let vp_height = window.innerHeight|| document.documentElement.clientHeight|| 
    document.body.clientHeight;
    let mainWidth = parseFloat(window.getComputedStyle(document.getElementById("main")).width);
    
        if (!(document.getElementById("aside").style.display == "none")) {
        let aside_w = document.getElementById("aside").offsetWidth;

        mainWidth -= aside_w;
    }
    let spacing = 50;
    if (vp_height < mainWidth) {
        w = h = vp_height - spacing;

    } else {
        w = h = mainWidth - spacing;
    }

    h *= (5/6);
    canvas.height = height = h;
    canvas.width = width = w;

    let graphContainer = document.getElementById("graph-container");
    graphContainer.style.width = w + "px";
    graphContainer.style.height = h + "px";

    let controlsContainer = document.getElementById("graph-control-main");
    let style = window.getComputedStyle(controlsContainer);
    let controlHeight = parseFloat(style.height);
    let newX = width * .005;
    let newY = height - newX - controlHeight;

    controlsContainer.style.left = newX + "px";
    controlsContainer.style.top = newY + "px";

    let termsLabel = document.getElementById("graph-N-label");

    const {paddingTop, paddingBottom} = getComputedStyle(termsLabel);
    const heightOfLines = termsLabel.offsetHeight - parseInt(paddingTop) - parseInt(paddingBottom);
    // console.log("offSetHeight: " + termsLabel.offsetHeight);
    // console.log("Padding top/bottom: " + parseInt(paddingTop) + ", " + parseInt(paddingBottom));
    // console.log("Height of Lines: " + heightOfLines);

    // if (heightOfLines > 18) {
    //     let current = document.getElementById("graph-control-main");
    //     current.style.width = (width * .98) + "px";
    //     console.log("Setting width to: " + current.style.width);
    // } else {
    //     let current = document.getElementById("graph-control-main");
    //     current.style.width = (width * .8) + "px";
    // }


}

