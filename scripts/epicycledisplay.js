

class DrawScreen {

    prevX;
    prevY;
    currX;
    currY;
    drawnFlag = false;
    #drawMode = false;
    
    constructor() {
        this.prevX = this.prevY = this.currX = this.currY = 0;
        document.getElementById("btn_finished").addEventListener("click", this.finishedButtonListener);
        document.getElementById("btn_erase").addEventListener("click", this.eraseButtonListener);
        document.getElementById("btn_samples").addEventListener("click", this.samplesButtonListener);
    }

    samplesButtonListener() {
        sampleScreen = true;
        drawScreen.removeDrawMouseListeners();
        drawScreen.initSampleScreen()
    }

    finishedButtonListener() {
        if (drawScreen.getDrawMode()) {
            drawScreen.setDrawMode(false);
            initDisplayMode();
    
            if (approxOnlyToggle) {
                drawApproximation();
            } else {
                timerId = startAnimationWrapper(drawEpicycles, camera.getTickRate());
            }
        } 
      }

    eraseButtonListener() {
        ctx.clearRect(0, 0, width, height);
        mouseInputs = [];
        drawScreen.drawDrawHere();
        document.getElementById("btn_finished").disabled = true;
    }
    
    initSampleScreen() {
        console.log("init sample screen");
        canvas.removeEventListener("click", this.selectSample);
    
        sampleChosen = -1;
    
        let size = .9;
        let padding = .08 * Math.min(width, height);
        let br = .03 * Math.min(width, height);
    
        let swidth = width * size;
        let sheight = height * size;
        let zx = (width - swidth) / 2;
        let zy = (height - sheight) / 2;
    
        ctx.clearRect(zx, zy, swidth, sheight);
        // draw "border"
        ctx.strokeStyle = "#FFA500";
        ctx.lineWidth = 4;
        ctx.strokeRect(zx, zy, swidth, sheight);
    
        let sampleDim = (Math.min(width, height) - padding * 4) / 2;
        console.log("Sampledim: " + sampleDim);
    
       clickBoxes = [];
    
        let p;
        let xt, yt;
        let col, row, index;
        col = row = index = 0;
    
        while (index < points.length) {
            p = points[index];
            p.updateAvailableArea(sampleDim, br);
            xt = zx + (padding * (col + 1)) + (sampleDim * col);
            yt = zy + (padding * (row + 1)) + (sampleDim * row);
    
            ctx.fillStyle = "black";
            // ctx.lineWidth = 2;
    
            ctx.beginPath();
            ctx.moveTo(p.getPointX(0) + xt, p.getPointY(0) + yt);
            for (let i = 0; i < p.getLength(); i++) {
                ctx.beginPath();
                ctx.arc(p.getPointX(i) + xt, p.getPointY(i) + yt, .5, 0, 2 * Math.PI, false);
                ctx.fill();
    
            }
    
            ctx.lineWidth = 3;
            ctx.strokeStyle = "green";
            ctx.strokeRect(xt, yt, sampleDim, sampleDim);
            clickBoxes.push([xt, yt, sampleDim]);
    
            index++;
            col++;
            if (col % 2 == 0) {
                col = 0;
                row++;
            }
        }
    
        let backArrowInc = (padding / 8);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(zx + backArrowInc, zy + (backArrowInc * 4));
        ctx.lineTo(zx + (backArrowInc * 3), zy + backArrowInc);
        ctx.lineTo(zx + (backArrowInc * 3), zy + (backArrowInc * 3));
        ctx.lineTo(zx + (backArrowInc * 6), zy + (backArrowInc * 3));
        ctx.lineTo(zx + (backArrowInc * 6), zy + (backArrowInc * 5));
        ctx.lineTo(zx + (backArrowInc * 3), zy + (backArrowInc * 5));
        ctx.lineTo(zx + (backArrowInc * 3), zy + (backArrowInc * 7));
        ctx.lineTo(zx + backArrowInc, zy + (backArrowInc * 4));
        ctx.stroke();
    
        clickBoxes.push([zx, zy, (backArrowInc * 7)]);
    
        canvas.addEventListener("click", this.selectSample);
    
    }
    
    selectSample(e) {
        console.log("Select sample attempt");
        let x = DrawScreen.getMousePos(canvas, e).x;
        let y = DrawScreen.getMousePos(canvas, e).y;
    
        console.log("Clicked on Sample Screen: " + x + ", " + y);
        console.log("click-boxes size: " + clickBoxes.length);
        for (let i = 0; i < clickBoxes.length; i++) {
            console.log(i + " | " + clickBoxes[i][0] + ", " + clickBoxes[i][1] + ", " + clickBoxes[i][2]);
        }
        let i = 0;
        let clicked = -1;
        for (; i < clickBoxes.length; i++) {
            if (x > clickBoxes[i][0] && x < (clickBoxes[i][0] + clickBoxes[i][2]) && y > clickBoxes[i][1] && y < (clickBoxes[i][1] + clickBoxes[i][2])) {
                clicked = i;
                console.log("clicked " + i);
                break;
            }
        }
    
        if (clicked != -1) {
            if (clicked < points.length) {
                sampleChosen = clicked;
                mouseInputs = [];
                points[sampleChosen].updateAvailableArea(width, breathing_room);
    
                for (let i = 0; i < points[sampleChosen].getLength(); i++) {
                    mouseInputs.push([points[sampleChosen].getPointX(i), points[sampleChosen].getPointY(i)]);
                }
    
                console.log("clicked sample - REMOVING click listener");
                sampleScreen = false;
                canvas.removeEventListener("click", this.selectSample);
                drawScreen.finishedButtonListener();
            }
            else {
                switch (clicked) {
                    case points.length:
                        console.log("clicked sample - REMOVING click listener");
                        sampleScreen = false;
                        canvas.removeEventListener("click", this.selectSample);
                        drawScreen.initDrawMode();
                }
            }
        }
    }

    initDrawMode() {
        this.#drawMode = true;
        this.drawnFlag = false;

        camera.reset();
        mouseInputs = [];
        sampleChosen = -1;
    
        document.getElementById("draw_control_div").style.display="flex";
        document.getElementById("draw_options_div").style.display="flex";
    
        document.getElementById("display_slider_div").style.display="none";
        document.getElementById("display_toggle_div").style.display = "none";
        document.getElementById("display_control_div").style.display="none";
        document.getElementById("btn_finished").disabled = true;
    
        scaleCanvas();
    
        ctx.clearRect(0, 0, width, height);
        this.drawDrawHere();
        console.log("Mouseinput Length: " + mouseInputs.length);
        drawScreen.addDrawMouseListeners();
    }

    addDrawMouseListeners() {
        canvas.addEventListener("mousemove", this.draw_mouseMove);
        canvas.addEventListener("mousedown", this.draw_mouseDown);
        canvas.addEventListener("mouseup", this.draw_mouseUp);
    }
    
    removeDrawMouseListeners() {
        canvas.removeEventListener("mousemove", this.draw_mouseMove);
        canvas.removeEventListener("mousedown", this.draw_mouseDown);
        canvas.removeEventListener("mouseup", this.draw_mouseUp);
    }

        /*
    RafalS https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas/33063222#33063222
    Oct 11, 2015
    */
    static getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
            y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
        };
    }


    
    draw_mouseDown(e) {
        if (!this.drawnFlag) {
            ctx.clearRect(0, 0, width, height);
            mouseInputs = [];
            document.getElementById("btn_finished").disabled = false;
        }

        ctx.clearRect(0, 0, width, height);
    
        this.prevX = this.currX;
        this.prevY = this.currY;
        this.currX = DrawScreen.getMousePos(canvas, e).x;
        this.currY = DrawScreen.getMousePos(canvas, e).y;
        this.drawnFlag = true;
    
            ctx.beginPath();
            ctx.fillStyle = "black";
            ctx.fillRect(this.currX, this.currY, 2, 2);
            ctx.closePath();
            mouseInputs.push([this.currX, this.currY]);
    }
    
    draw_mouseUp() {
    
        if (document.getElementById("closed_form_toggle").checked) { // trying to draw a closed shape
            let x = mouseInputs[0][0];
            let y = mouseInputs[0][1];
            mouseInputs.push([x,y]);
            ctx.beginPath();
            ctx.moveTo(this.currX, this.currY);
            ctx.lineTo(x,y);
            ctx.stroke();
        } else {
            // manual reverse
            let rev = [];
            for (let i = 0; i < mouseInputs.length; i++) {
                rev.push([mouseInputs[mouseInputs.length - 1 - i][0], mouseInputs[mouseInputs.length - 1 - i][1]]);
            }
            mouseInputs = mouseInputs.concat(rev);
        }
    
    
        this.drawnFlag = false;
    }
    
    draw_mouseMove(e) {
    
        if (this.drawnFlag) {
            this.prevX = this.currX;
            this.prevY = this.currY;
            this.currX = DrawScreen.getMousePos(canvas, e).x;
            this.currY = DrawScreen.getMousePos(canvas, e).y;
            mouseInputs.push([this.currX, this.currY]);

            ctx.beginPath();
            ctx.moveTo(this.prevX, this.prevY);
            ctx.lineTo(this.currX, this.currY);
            ctx.strokeStyle = "black";
            ctx.lineWidth = drawLineWidth;
            ctx.stroke();
            ctx.closePath();
            
        }
    }

    drawDrawHere() {
        let text = "draw here!";
        let size = "48";
        ctx.font =  size + "px serif";
        let w = ctx.measureText(text).width;
        let x = (width - w) / 2;
        let y = (height - parseInt(size)) / 2;
        ctx.fillStyle = "rgb(130 151 184 / 50%)";
        ctx.fillText(text, x, y);
    
    }

    getDrawMode(){return this.#drawMode;}
    setDrawMode(b){this.#drawMode = b;}
}

class Points {
    #minX;
    #minY;
    #maxX;
    #maxY;
    #tx;
    #ty;
    #scale;
    #arr;
    
    constructor(arr) {
        
        this.#scale = 1;
        this.#tx = 0;
        this.#ty = 0;

        this.#minX = this.#minY = Number.MAX_VALUE;
        this.#maxX = this.#maxY = Number.MIN_VALUE;
    
        for (let i = 0; i < arr.length; i++) {
            this.#minX = Math.min(this.#minX, arr[i][0]);
            this.#minY = Math.min(this.#minY, arr[i][1]);
            this.#maxX = Math.max(this.#maxX, arr[i][0]);
            this.#maxY = Math.max(this.#maxY, arr[i][1]);
        }

        console.log("In points minX,Y | maxX,Y: " + this.#minX + ", " + this.#minY + " | " + this.#maxX+ ", " + this.#maxY);
        this.#arr = arr;
    }

    getMinX() {
        return this.#minX;
    }

    getMaxX() {
        return this.#maxX;
    }

    getMinY() {
        return this.#minY;
    }

    getMaxY() {
        return this.#maxY;
    }

    updateAvailableArea(dim, breathing_room) {
        let range = Math.max(this.#maxX-this.#minX, this.#maxY - this.#minY);
        console.log("In points RANGE: " + range);
        this.#scale = (dim - 2*breathing_room) / range;
        console.log("IN POINTS scale: " + this.#scale);
        // let xRange = (this.#maxX - this.#minX) * this.#scale;
        // let xScale = (dim - xRange) / 2;
        // this.#tx = xScale - (this.#minX * this.#scale);

        // let yRange = (this.#maxY - this.#minY) * this.#scale;
        // let yScale = (dim - yRange) / 2;
        // this.#ty = yScale - (this.#minY * this.#scale);
        
        this.#tx = (dim - ((this.#maxX - this.#minX) * this.#scale)) / 2 - (this.#minX * this.#scale);
        this.#ty = (dim - ((this.#maxY - this.#minY) * this.#scale)) / 2 - (this.#minY * this.#scale);

        console.log("tx, ty: " + this.#tx + ", " + this.#ty);
    }

    getLength() {
        return this.#arr.length;
    }

    getPointX(i) {
        let x = (this.#arr[i][0] * this.#scale + this.#tx);

        return x;
    }
    getPointY(i) {
        let y = (this.#arr[i][1] * this.#scale + this.#ty);
        return y;
    }
    
}

class Camera {
    #zoom;
    #focusedOn;
    #tx;
    #ty;
    #tickRate;
    #saveState;
    #saved;

    constructor(currentTick) {

        this.#zoom = 1;
        this.#focusedOn = 0;
        this.#tx = 0;
        this.#ty = 0;
        this.#tickRate = currentTick;
        this.#saved = false;
        
    }

    save() {
        this.#saved = true;
        this.#saveState = new Camera(this.#tickRate);
        this.#saveState.#zoom = this.#zoom;
        this.#saveState.#focusedOn = this.#focusedOn;
        this.#saveState.#tx = this.#tx;
        this.#saveState.#ty = this.#ty;
        this.#saveState.#tickRate = this.#tickRate;
    }

    load() {
        if (!this.#saved) {
            return;
        }

        this.#zoom = this.#saveState.#zoom;
        this.#focusedOn = this.#saveState.#focusedOn;
        this.#tx = this.#saveState.#tx;
        this.#ty = this.#saveState.#ty;
        this.#tickRate = this.#saveState.#tickRate;
    }

    reset() {
        this.#zoom = 1;
        this.#focusedOn = 0;
        this.#tx = 0;
        this.#ty = 0;
        this.#tickRate = defaultTick
    }

    zoomTo(inUse) {
        this.#focusedOn = inUse;
        if (inUse == 0) {
            this.reset();
            return;
        }

        this.updateZoom();
    }

    zoomIn() {
        if (this.#focusedOn + 1 >= numVectInUse) {
            return false;
        }

        this.#focusedOn++;
        this.updateZoom();

        return true;
    }

    zoomOut() {
        if (this.#focusedOn <= 0) {
            return false;
        }

        this.#focusedOn--;

        if (this.#focusedOn == 0) {
            this.reset();
            return true;
        }

        this.updateZoom();
        return true;
    }

    updateZoom() {
        let previousZoom = this.#zoom;

        let range = vectors[this.#focusedOn].radius * 2;
        this.#zoom = (Math.min(width, height) - (breathing_room * 2)) / range;

        if (this.#zoom > (Math.min(width, height) / 5)) {
            this.#zoom = previousZoom;
            return;
        }

        if (this.#focusedOn == 0) {
            this.#tickRate = defaultTick;
            stopAnimationWrapper(timerId);
            timerId = startAnimationWrapper(drawEpicycles, this.#tickRate);
            return;
        }
        let tRate = this.#tickRate * (this.#zoom / previousZoom);

        if (this.#withinRateRange(tRate)) {
            this.#tickRate = tRate;
            stopAnimationWrapper(timerId);
            timerId = startAnimationWrapper(drawEpicycles, this.#tickRate);
        }
    }



    center(x, y, dim) {
        // console.log("tx,ty: " + this.tx + ", " + this.ty);
        // console.log("Recalculating with: x,y,dim: " + x + ", " + y + " | ");
        // console.log("-");
        this.#tx = (width / 2) - (x * this.#zoom);
        this.#ty = (height / 2) - (y * this.#zoom);
    }

    #withinRateRange(rate) {
        return (rate >= defaultTick) && (rate <= defaultTick*5);
    }

    getTx() {return this.#tx;}
    getTy() {return this.#ty;}
    getZoom() {return this.#zoom}
    getFocusedOn() {return this.#focusedOn}
    getTickRate() {return this.#tickRate}
    setTickRate(tickRate) {this.#tickRate = tickRate;} 
}

const canvas = document.getElementById("canvas_interactive");
const defaultNumOfVectors = 5;
const defaultTick = 30;
const ctx = canvas.getContext("2d");
const drawLineWidth = 2;


function main() {
    // initialize global variables
    points = [];
    var samples = [];
    samples.push(PI_arr, squares_arr, summation_arr);
    
    for (let i = 0; i < samples.length; i++) {
        points.push(new Points(samples[i]));
    }

    var positionInfo = canvas.getBoundingClientRect();
    height = positionInfo.height;
    width = positionInfo.width;

}

let points;

var height;
var width;
var vectors;
var mouseInputs = [];
var currT = 0;
var numVectInUse = defaultNumOfVectors;

var approximation = [];
var breathing_room = width * .3;
var timerId;
var running = false;


let totalAvailableVectors;
let transformation;
let circleShownToggle = true;
let goalShownToggle = true;
let approxOnlyToggle = false;
let tInc = .03;
let maxNumberOfVectors = 300;
let clickBoxes = [];

let sampleScreen = false;

let sampleChosen = -1;

main();

var drawScreen = new DrawScreen();
var camera = new Camera(defaultTick);


focusSlider = document.getElementById("range_focus_selector");
focusSlider.addEventListener("input", focusSliderListener);

adjustNSlider = document.getElementById("range_adjust_n");
adjustNSlider.addEventListener("input", adjustNSliderListener);


window.addEventListener('resize', scaleCanvas);
window.addEventListener("load", loadListener);

document.getElementById("btn_back").addEventListener("click", backButtonListener);
document.getElementById("show_goal_toggle").addEventListener('change', showGoalToggleListener);
document.getElementById("just_approx_toggle").addEventListener('change', approxOnlyToggleListener);
document.getElementById("circle_visibility_toggle").addEventListener('change', function(){circleShownToggle = this.checked});

function initSamples() {
    var samples = [];
    var p = [];

    samples.push(PI_arr, squares_arr, summation_arr);
    
    
    for (let i = 0; i < samples.length; i++) {
        p.push(new Points(samples[i]));
    }

    return p;
}


function loadListener() {
    drawScreen.initDrawMode();
    scaleCanvas();
}





function backButtonListener() {
    stopAnimationWrapper(timerId);
    drawScreen.initDrawMode();
}



function showGoalToggleListener() {
    goalShownToggle = this.checked;

    if (approxOnlyToggle) {
        drawApproximation();
    }
}

function approxOnlyToggleListener() {
    approxOnlyToggle = this.checked;

    if (approxOnlyToggle) {
        stopAnimationWrapper(timerId);
        camera.save();
        camera.reset();

        document.getElementById("range_focus_selector").disabled = true;
        drawApproximation();
    } else {
        stopAnimationWrapper(timerId);

        document.getElementById("range_focus_selector").disabled = false;
        camera.load();

        console.log("# Vectors Value: " + adjustNSlider.value);
        numVectInUse = adjustNSlider.value;
        vectors = transformation.getVectors(numVectInUse);

        if (focusSlider.value >= numVectInUse) {
            focusSlider.value = (numVectInUse - 1);
            camera.zoomTo(numVectInUse - 1);
        }

        focusSlider.max = (numVectInUse - 1);
        timerId = startAnimationWrapper(drawEpicycles, camera.getTickRate());
    }
}

function focusSliderListener() {
    // clearInterval(timerId);
    // camera.zoomTo(focusSlider.value);
    // timerId = setInterval(drawEpicycles, camera.tickRate);

    camera.zoomTo(focusSlider.value);
}

function startAnimationWrapper(fx, tRate) {
    
    if (!running) {
        running = true;
        t = setInterval(fx, tRate);
        return t;
    }
    return timerId;
}

function stopAnimationWrapper(t) {
    clearInterval(t);
    running = false;
}

function adjustNSliderListener() {
    if (approxOnlyToggle) {
        numVectInUse = adjustNSlider.value;
        vectors = transformation.getVectors(numVectInUse);
        drawApproximation();
    } else {

        stopAnimationWrapper(timerId);

        numVectInUse = adjustNSlider.value;
        vectors = transformation.getVectors(numVectInUse);
        console.log("# NSlider: " + adjustNSlider.value + " | numVectors: " + numVectInUse);
        focusSlider.max = numVectInUse - 1;

        if (focusSlider.value >= numVectInUse) {
            focusSlider.value = (numVectInUse - 1);

            camera.zoomTo(numVectInUse - 1);

            focusSlider.max = (numVectInUse - 1);

        }
        timerId = startAnimationWrapper(drawEpicycles, camera.getTickRate());
    }


}






function canvasToCoords(inputs) {
    let scaled = [];
    let x, y;
    for (let i = 0; i < inputs.length; i++) {
        x = inputs[i][0];
        y = inputs[i][1];
        x -= (width / 2);
        y = (height / 2) - y;


        scaled.push([x, y]);
    }
    return scaled;
}

function coordstoDraw(coords) {
    let toDraw = [];
    let x, y;

    for (let i = 0; i < coords.length; i++) {
        x = (coords[i][0] + (width / 2)) * camera.getZoom() + camera.getTx();
        y = ((height / 2) - coords[i][1]) * camera.getZoom() + camera.getTy();
        toDraw.push([x, y]);
    }

    return toDraw;
}






function initDisplayMode() {
    ctx.clearRect(0, 0, width, height);
    camera.reset();

    approximation = [];
    currT = 0;
    document.getElementById("draw_control_div").style.display="none";
    document.getElementById("draw_options_div").style.display="none";
    // document.getElementById("focus_div").style.display = "block";
    // document.getElementById("adjust_n_div").style.display = "block";
    // document.getElementById("circle_toggle_div").style.display = "block";
    // document.getElementById("approx_toggle_div").style.display = "block";

    document.getElementById("display_slider_div").style.display ="flex";
    document.getElementById("display_toggle_div").style.display = "flex";
    document.getElementById("display_control_div").style.display="flex";

    
    drawScreen.removeDrawMouseListeners();
    scaleCanvas();

    // console.log("INITDISPLAYMODE: mouse inputs, PRE COORDINATE SHIFT " + mouseInputs.length + "\n\n ");
    // for (let i = 0; i < mouseInputs.length; i++) {
    //     console.log("x, y: " + mouseInputs[i][0] + ", " + mouseInputs[i][1]);
    // }

    let scaledInputs = canvasToCoords(mouseInputs);
    mouseInputs = scaledInputs;

    // console.log("INITDISPLAYMODE: mouse inputs "+ mouseInputs.length + "\n\n ");
    // for (let i = 0; i < mouseInputs.length; i++) {
    //     console.log("x, y: " + mouseInputs[i][0] + ", " + mouseInputs[i][1]);
    // }

    minX = minY = Number.MAX_VALUE;
    maxX = maxY = Number.MIN_VALUE;
    vectors = [];

    for (let i = 0; i < scaledInputs.length; i++) {
        minX = Math.min(minX, scaledInputs[i][0]);
        minY = Math.min(minY, scaledInputs[i][1]);
        maxX = Math.max(maxX, scaledInputs[i][0]);
        maxY = Math.max(maxY, scaledInputs[i][1]);
    }




    transformation = new Transformation(scaledInputs);
    console.log("total available vectors = " + transformation.vectors.length);
    totalAvailableVectors = transformation.vectors.length;
    adjustNSlider.max = Math.min(totalAvailableVectors, maxNumberOfVectors);
    numVectInUse = Math.min(totalAvailableVectors, defaultNumOfVectors);
    adjustNSlider.value = numVectInUse;
    focusSlider.max = numVectInUse - 1;
    focusSlider.value = 0;
    vectors = transformation.getVectors(numVectInUse);
}

function drawApproximation() {
    ctx.clearRect(0, 0, width, height);
    let approx = [];
    let endPoints = [];
    let t = 0;

    while (t <= (2*Math.PI + tInc)) {
        endPoints = getVectorEndpoints(t);
        approx.push([endPoints[endPoints.length - 1][0], endPoints[endPoints.length - 1][1]]);
        t += tInc;
    }

    drawGoal();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#aaffd3";
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(coordsToDrawX(approx[0][0]), coordsToDrawY(approx[0][1]));

    for (let i = 1; i < approx.length; i++) {

        ctx.lineTo(coordsToDrawX(approx[i][0]), coordsToDrawY(approx[i][1]));
    }
    ctx.stroke();

    drawNumVectors();
}

function drawEpicycles() { 

    ctx.clearRect(0, 0, width, height);

    drawGoal();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000000";
    ctx.setLineDash([]);


    // calculate the centers of every circle
    let circleCenters = getVectorEndpoints(currT);




    if (camera.getFocusedOn() != 0) {
        camera.center(circleCenters[camera.getFocusedOn() - 1][0] + (width / 2), (height / 2) - circleCenters[camera.getFocusedOn() - 1][1]);
    }

    if (circleShownToggle) {
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

    drawNumVectors();

    currT += tInc;
}

function drawNumVectors() {
    ctx.font = "48px serif";
    ctx.strokeText(numVectInUse, (width * .8), (height * .95));
}

function drawGoal() {
    if (!goalShownToggle) {
        return;
    }
    // let dashSpace = document.getElementById("closed_form_toggle").checked ? 2 : 6;
    // ctx.setLineDash([4, dashSpace]);
    // ctx.lineWidth = 1;
    ctx.fillStyle = "rgb(86 98 102 / 50%)";
    // ctx.moveTo(coordsToDrawX(mouseInputs[0][0]), coordsToDrawY(mouseInputs[0][1]));
    
    // if (currT == 0) {
    //         console.log("\n\n " + mouseInputs.length);

    // }

    for (let i = 0; i < mouseInputs.length; i++) {
        ctx.beginPath();

        let x = coordsToDrawX(mouseInputs[i][0]);
        let y = coordsToDrawY(mouseInputs[i][1]);
        ctx.arc(x, y, 1, 0, 2*Math.PI, false);
        ctx.fill();

        // if (currT == 0) {
        //     console.log("Draw Goal: " + mouseInputs[i][0] + ", " + mouseInputs[i][1] + " -> | " + x + ", " + y);
        // }
    }
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

function getVectorEndpoints(time) {
    let endpoints = [];

    for (let i = 0; i < numVectInUse; i++) {
        if (i == 0) {
            let x = vectors[0].radius * Math.cos(time * vectors[0].scaledIndex + vectors[0].offset);
            let y = vectors[0].radius * Math.sin(time * vectors[0].scaledIndex + vectors[0].offset);
            endpoints.push([x, y]);
        } else {
            
            x = endpoints[i - 1][0] + vectors[i].radius * Math.cos(time * vectors[i].scaledIndex + vectors[i].offset);
            y = endpoints[i - 1][1] + vectors[i].radius * Math.sin(time * vectors[i].scaledIndex + vectors[i].offset);

            endpoints.push([x, y]);
        }
    } 
    return endpoints;
}

function scale(radius) {
    return radius * camera.getZoom();
}



function coordsToDrawX(x) {
let coord = x + ((width / (2)));

        return coord * camera.getZoom() + camera.getTx();
    
}

function coordsToDrawY(y) {
    let coord = (height / 2) - y;
    return coord * camera.getZoom()+ camera.getTy();
        // return ((height / (2)) / 1) - y;
}




function scaleCanvas() {
    let controls_container = document.getElementById("epi_controls_container");
    let epi_container = document.getElementById("epi_container");
    let vp_width  = window.innerWidth || document.documentElement.clientWidth || 
    document.body.clientWidth;
    let vp_height = window.innerHeight|| document.documentElement.clientHeight|| 
    document.body.clientHeight;
    

    let control_height = controls_container.offsetHeight;

    console.log("Viewport w,h: " + vp_width + ", " + vp_height + " controlHeight: " + control_height);


    if ((vp_height + (controls_container.offsetHeight )) < window.innerWidth) {
        w = h = (vp_height - controls_container.offsetHeight);
        epi_container.style.width = w + "px";
        epi_container.style.height = vp_height + "px";
    } else {
        w = h = window.innerWidth - control_height;
        epi_container.style.width = w + "px";
        epi_container.style.height = h + control_height + "px";
    }

    canvas.width = width  = w;
    canvas.height = height = h;

    breathing_room = width * .3;

    if (drawScreen.getDrawMode()) { // redraw users rendition
        if (mouseInputs.length == 0) {
            drawScreen.drawDrawHere();
        } else {
            ctx.beginPath();
            ctx.moveTo(mouseInputs[0][0], mouseInputs[0][1]);
            for (let i = 1; i < mouseInputs.length; i++) {
            ctx.lineTo(mouseInputs[i][0], mouseInputs[i][1]);
            }
            ctx.strokeStyle = "black";
            ctx.lineWidth = drawLineWidth;
            ctx.stroke();
            ctx.closePath();
        }
        if (sampleScreen) {
            initSampleScreen();
        }
    } else if (approxOnlyToggle) {
        drawApproximation();
    }
}



