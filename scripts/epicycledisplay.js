class Camera {
    zoom;
    focusedOn;
    width;
    height;
    tx;
    ty;

    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.zoom = 1;
        this.focusedOn = 0;
        this.tx = 0;
        this.ty = 0;
    }

    reset() {
        this.zoom = 1;
        this.focusedOn = 0;
        this.tx = 0;
        this.ty = 0;
    }

    center(x, y, dim) {
        // console.log("tx,ty: " + this.tx + ", " + this.ty);
        // console.log("Recalculating with: x,y,dim: " + x + ", " + y + " | ");
        // console.log("-");
        this.tx = (this.width / 2) - (x * this.zoom);
        this.ty = (this.height / 2) - (y * this.zoom);
    }



    zoomIn() {
        if (this.focusedOn + 1 >= numVectInUse) {
            return false;
        }

        this.focusedOn++;
        this.updateZoom();

        return true;
    }

    zoomOut() {
        if (this.focusedOn <= 0) {
            return false;
        }

        this.focusedOn--;

        if (this.focusedOn == 0) {
            this.init();
            return true;
        }

        this.updateZoom();
        return true;
    }

    updateZoom() {
        let previousZoom = this.zoom;

        let range = vectors[this.focusedOn].radius * 2;
        this.zoom = (Math.min(width, height) - (breathing_room * 2)) / range;

        if (this.zoom > (Math.min(width, height) / 5)) {
            this.zoom = previousZoom;
            return;
        }
        let tRate = tickRate * (this.zoom / previousZoom);

        if (this.#withinRateRange(tRate)) {
            tickRate = tRate;
            clearInterval(timerId);
            timerId = setInterval(drawEpicycles, tickRate);
        }
        console.log("tickRate: " + tickRate);
    }

    #withinRateRange(rate) {
        return (rate >= defaultTick) && (rate <= 100);
    }
    
}

const canvas = document.getElementById("canvas-interactive");

var positionInfo = canvas.getBoundingClientRect();
var height = positionInfo.height;
var width = positionInfo.width;
var camera = new Camera(width, height);

var vectors;
var minX, minY, maxX, maxY, minC, maxRange;
    drawnFlag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;


var drawLineWidth = 2;

var mouseInputs = [];
var circleCenters = [];

currT = 0;
const defaultNumOfVectors = 5;
let numVectInUse = defaultNumOfVectors;
approximation = [];
breathing_room = width * .3;
drawMode = true;
centered = false;
let timerId;
const defaultTick = 10;
let tickRate = defaultTick;
let totalAvailableVectors;
let transformation;



const ctx = canvas.getContext("2d");



let raf;

window.addEventListener("load", () => {
    scaleCanvas();
});

window.addEventListener('resize', () => {
    scaleCanvas();

});


swapButton = document.getElementById("btn_swap");
swapButton.addEventListener("click", swapButtonListener);
eraseButton = document.getElementById("btn_erase");
eraseButton.addEventListener("click", eraseButtonListener);
zoomInButton = document.getElementById("btn_zoomin");
zoomInButton.addEventListener("click", zoomInButtonListener);
zoomOutButton = document.getElementById("btn_zoomout");
zoomOutButton.addEventListener("click", zoomOutButtonListener);

adjustNSlider = document.getElementById("range_adjust_n");
adjustNSlider.addEventListener("input", () => {
    console.log("Value: " + adjustNSlider.value);
    numVectInUse = adjustNSlider.value;
    vectors = transformation.getVectors(numVectInUse);
});

initDrawMode();



// function adjustPage() {
//     // let aside = document.getElementById("aside");
//     // console.log("aside.offSetWidth: " + aside.offsetWidth);
//     // if (aside.offsetWidth < 200) {
//     //     aside.style.display = "none";
//     // } else {
//     //     aside.style.display = "block";
//     // }
// }

function scaleCanvas() {
    let controls_container = document.getElementById("epi-controls-container");
    let epi_container = document.getElementById("epi-container");
    let vp_width  = window.innerWidth || document.documentElement.clientWidth || 
    document.body.clientWidth;
    let vp_height = window.innerHeight|| document.documentElement.clientHeight|| 
    document.body.clientHeight;
    
    console.log(vp_width, vp_height);

    let control_height = controls_container.offsetHeight;


    if ((vp_height + (controls_container.offsetHeight )) < window.innerWidth) {
        w = h = (vp_height - controls_container.offsetHeight);
        // console.log("dim: " + w + " | " + vp_height + " - " + controls_container.offsetHeight);
        console.log("One");
        epi_container.style.width = w + "px";
        epi_container.style.height = vp_height + "px";
    } else {
        w = h = window.innerWidth - control_height;
        epi_container.style.width = w + "px";
        epi_container.style.height = h + control_height + "px";
        console.log("two");
    }
    // console.log("epi w,h: " + epi_container.offsetWidth + ", " + epi_container.offsetHeight);
    // canvas.width = width = camera.width = 900;
    // container.offsetWidth = 200;
    canvas.width = width = camera.width = w;
    canvas.height = height = camera.height = h;
    // console.log("canvas w, h: " + canvas.width + ", " + canvas.height);

    breathing_room = width * .3;
    // camera.updateZoom();
    // console.log(circleCenters.length);
    //     camera.center(circleCenters[camera.focusedOn-1][0] + (width / 2), (height / 2) - circleCenters[camera.focusedOn-1][1]);

    // console.log("canvasW,H: " + canvas.width + ", " + canvas.height);
    // console.log("W,H: " + width + ", " + height);
}



function zoomOutButtonListener() {
    camera.zoomOut();
    console.log("Zoom: " + camera.zoom + " | focusedOn: " + camera.focusedOn);
    console.log("width: " + width + " , height: " + height);
}

function zoomInButtonListener() {
    // scaleFactor += vectors[focusedOn].radius / vectors[focusedOn +1].radius;
    camera.zoomIn();
    console.log("Zoom: " + camera.zoom + " | focusedOn: " + camera.focusedOn);
    console.log("width: " + width + " , height: " + height);

}

function eraseButtonListener() {
    if (drawMode) {
        ctx.clearRect(0, 0, width, height);
        mouseInputs = [];
    } else {
        if (!centered) {
            centered = true;
            eraseButton.value = "Un-Center";
        } else {
            centered = false;
            eraseButton.value = "Center";
        }
    }
}

function initDrawMode() {
    drawMode = true;
    mouseInputs = [];
    swapButton.value = "Finished";
    eraseButton.value = "Erase";
    zoomInButton.style.display = "none";
    zoomOutButton.style.display = "none";
    adjustNSlider.style.display = "none";

    ctx.clearRect(0, 0, width, height);
    canvas.addEventListener("mousemove", draw_mouseMove);
    canvas.addEventListener("mousedown", draw_mouseDown);
    canvas.addEventListener("mouseup", draw_mouseUp);
}

function swapButtonListener() {
    if (drawMode) {
        drawMode = false;
        approximation = [];
        currT = 0;
        swapButton.value = "Back";
        eraseButton.value = centered ? "Un-Center" : "Center";
        zoomInButton.style.display = "block";
        zoomOutButton.style.display = "block";
        adjustNSlider.style.display = "block";
        swapToEpicycles();
        timerId = setInterval(drawEpicycles, tickRate);
    } else {
        // window.cancelAnimationFrame(raf);

        tickRate = defaultTick;
        clearInterval(timerId);

        initDrawMode(); 
    }
  }

function canvasToCoords(inputs) {
    let scaled = [];
    let x, y;
    for (let i = 0; i < inputs.length; i++) {
        x = inputs[i][0];
        y = inputs[i][1];
        // console.log("Prescaled: " + x + ", " + y);
        x -= (width / 2);
        y = (height / 2) - y;
        // x *= .1;
        // y *= .1;
        // console.log("Postscaled: " + x + ", " + y);

        scaled.push([x, y]);
    }
    return scaled;
}

function coordstoDraw(coords) {
    let toDraw = [];
    let x, y;

    for (let i = 0; i < coords.length; i++) {
        x = (coords[i][0] + (width / 2)) * camera.zoom + camera.tx;
        y = ((height / 2) - coords[i][1]) * camera.zoom + camera.ty;
        toDraw.push([x, y]);
    }

    return toDraw;
}

function swapToEpicycles() {
    ctx.clearRect(0, 0, width, height);
    camera.reset();
    
    canvas.removeEventListener("mousemove", draw_mouseMove);
    canvas.removeEventListener("mousedown", draw_mouseDown);
    canvas.removeEventListener("mouseup", draw_mouseUp);

    let scaledInputs = canvasToCoords(mouseInputs);
    mouseInputs = scaledInputs;

    minX = minY = Number.MAX_VALUE;
    maxX = maxY = Number.MIN_VALUE;
    vectors = [];

    for (let i = 0; i < scaledInputs.length; i++) {
        minX = Math.min(minX, scaledInputs[i][0]);
        minY = Math.min(minY, scaledInputs[i][1]);
        maxX = Math.max(maxX, scaledInputs[i][0]);
        maxY = Math.max(maxY, scaledInputs[i][1]);
    }


    minC = Math.min(minX, minY);
    maxRange = Math.max(maxX - minX, maxY - minY);
    // console.log("min: " + minX + ", " + minY + " | max: " + maxX + ", " + maxY);

    transformation = new Transformation(scaledInputs);
    console.log("total available vectors = " + transformation.vectors.length);
    totalAvailableVectors = transformation.vectors.length;
    adjustNSlider.max = totalAvailableVectors;
    numVectInUse = defaultNumOfVectors;
    vectors = transformation.getVectors(numVectInUse);
    // raf = window.requestAnimationFrame(drawEpicycles);

}



function drawEpicycles() { 

    // console.log("drawEpicycles");
    ctx.clearRect(0, 0, width, height);
    ctx.setLineDash([4, 2]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000000";


    

    ctx.beginPath();
    ctx.moveTo(coordsToDrawX(mouseInputs[0][0]), coordsToDrawY(mouseInputs[0][1]));
    for (let i = 1; i < mouseInputs.length; i++) {
        let x = coordsToDrawX(mouseInputs[i][0]);
        let y = coordsToDrawY(mouseInputs[i][1]);
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000000";
    ctx.setLineDash([]);


    // calculate the centers of every circle
    circleCenters = [];

    for (let i = 0; i < numVectInUse; i++) {
        if (i == 0) {
            let x = vectors[0].radius * Math.cos(currT * vectors[0].scaledIndex + vectors[0].offset);
            let y = vectors[0].radius * Math.sin(currT * vectors[0].scaledIndex + vectors[0].offset);
            circleCenters.push([x, y]);
        } else {
            
            x = circleCenters[i - 1][0] + vectors[i].radius * Math.cos(currT * vectors[i].scaledIndex + vectors[i].offset);
            y = circleCenters[i - 1][1] + vectors[i].radius * Math.sin(currT * vectors[i].scaledIndex + vectors[i].offset);
            if (i == camera.focusedOn) {
                camera.center(circleCenters[i-1][0] + (width / 2), (height / 2) - circleCenters[i-1][1]);
            }
            circleCenters.push([x, y]);
        }
    } 

    ctx.beginPath();
    ctx.arc(coordsToDrawX(0), coordsToDrawY(0), scale(vectors[0].radius), 0, 2*Math.PI, true);
    ctx.stroke();

    // draw each circle
    for (let i = 1; i < numVectInUse; i++) {
        if (i == camera.focusedOn) {
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#ffabaa";
        }
        else if (i < camera.focusedOn && camera.focusedOn != 0) {
            ctx.strokeStyle = "rgb(70 70 70 / 20%)";
            ctx.lineWidth = 1;
        } else {
            ctx.strokeStyle = "rgb(70 70 70)";
            ctx.lineWidth = 1;
        }
        ctx.beginPath();
        ctx.arc(coordsToDrawX(circleCenters[i-1][0]), coordsToDrawY(circleCenters[i-1][1]), scale(vectors[i].radius), 0, 2*Math.PI, true);
        ctx.stroke();
    }

    // draw radial lines for each circle
    ctx.strokeStyle = "#82b2ff";
    ctx.beginPath();
    ctx.moveTo(coordsToDrawX(0), coordsToDrawY(0));

    for (let i = 0; i < numVectInUse; i++) {
        ctx.lineTo(coordsToDrawX(circleCenters[i][0]), coordsToDrawY(circleCenters[i][1]));
    }
    ctx.stroke();

    // add final value of fourier transform at currT
    approximation.push([circleCenters[numVectInUse - 1][0], circleCenters[numVectInUse-1][1]]);

    if (currT > (Math.PI * 2) + .1) {
        approximation.shift();
    }

    // draw actual approximation
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#aaffd3";
    ctx.beginPath(coordsToDrawX(approximation[0][0]), coordsToDrawY(approximation[0][1]));

    for (let i = 1; i < approximation.length; i++) {
        ctx.lineTo(coordsToDrawX(approximation[i][0]), coordsToDrawY(approximation[i][1]));
    }
    ctx.stroke();

    // draw circle showing current x,y value of fourier transform at currT
    ctx.fillStyle = "#32fa92";
    ctx.beginPath();
    ctx.arc(coordsToDrawX(circleCenters[circleCenters.length - 1][0]), coordsToDrawY(circleCenters[circleCenters.length - 1][1]), 5, 0, 2*Math.PI, true);
    ctx.fill();

    ctx.font = "48px serif";
    ctx.strokeText(numVectInUse, (width * .8), (height * .95));

    currT += .01;
    // await new Promise(r => setTimeout(r, 200));


    // raf = window.requestAnimationFrame(drawEpicycles);
    
    
}

function getCoords(currT) {
    let coords = [];
    let x = vectors[0].radius * Math.cos(currT * vectors[0].scaledIndex + vectors[0].offset);
    let y = vectors[0].radius * Math.sin(currT * vectors[0].scaledIndex + vectors[0].offset);
    coords.push([x, y]);

    for (let i = 1; i < numVectInUse; i++) {
        x = coords[i - 1][0] + vectors[i].radius * Math.cos(currT * vectors[i].scaledIndex + vectors[i].offset);
        y = coords[i - 1][1] + vectors[i].radius * Math.sin(currT * vectors[i].scaledIndex + vectors[i].offset);
        
        coords.push([x, y]);
    }

    return coords;
}

function scale(radius) {
    return radius * camera.zoom;
}



function coordsToDrawX(x) {
let coord = x + ((width / (2)));

        return coord * camera.zoom + camera.tx;
    
}

function coordsToDrawY(y) {
    let coord = (height / 2) - y;
    return coord * camera.zoom + camera.ty;
        // return ((height / (2)) / 1) - y;
}

function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = "black";
    ctx.lineWidth = drawLineWidth;
    ctx.stroke();
    ctx.closePath();
}

function draw_mouseDown(e) {
    if (!drawnFlag) {
        ctx.clearRect(0, 0, width, height);
        mouseInputs = [];
    }
    prevX = currX;
    prevY = currY;
    currX = getMousePos(canvas, e).x;
    currY = getMousePos(canvas, e).y;
    console.log("Mouse x,y: " + currX + ", " + currY);
    drawnFlag = true;

        ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.fillRect(currX, currY, 2, 2);
        ctx.closePath();
        mouseInputs.push([currX, currY]);
}

function draw_mouseUp() {
    let x, y;
    let threshold = 20;

    let d = Math.sqrt((currX - mouseInputs[0][0]) * (currX - mouseInputs[0][0]) + 
        (currY - mouseInputs[0][1])*(currY - mouseInputs[0][1]));
    console.log("CurrX,Y: " + currX + ", " + currY + " | firstX,Y: " + mouseInputs[0][0] + ", " + 
        mouseInputs[0][1] + " | distance: " + d);

        console.log("BeforeLength: " + mouseInputs.length);
    if (d < threshold) { // assume trying to draw a closed shape
        x = mouseInputs[0][0];
        y = mouseInputs[0][1];
        mouseInputs.push([mouseInputs[0][0], mouseInputs[0][1]]);
        ctx.beginPath();
        ctx.moveTo(currX, currY);
        ctx.lineTo(mouseInputs[0][0], mouseInputs[0][1]);
        ctx.stroke();
    } else {
        // manual reverse
        let rev = [];
        for (let i = 0; i < mouseInputs.length; i++) {
            rev.push([mouseInputs[mouseInputs.length - 1 - i][0], mouseInputs[mouseInputs.length - 1 - i][1]]);
        }
        mouseInputs = mouseInputs.concat(rev);
    }
    console.log("AfterLength: " + mouseInputs.length);
    for (let i = 0; i < mouseInputs.length; i++) {
        console.log(i + " | x,y: " + mouseInputs[i][0] + ", " + mouseInputs[i][1]);
    }

    drawnFlag = false;
}

function draw_mouseMove(e) {

    if (drawnFlag) {
        prevX = currX;
        prevY = currY;
        currX = getMousePos(canvas, e).x;
        currY = getMousePos(canvas, e).y;
        mouseInputs.push([currX, currY]);
        draw();
    }
}

/*
RafalS https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas/33063222#33063222
Oct 11, 2015
*/
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
}