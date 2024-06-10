class Camera {
    zoom;
    focusedOn;
    width;
    height;
    tx;
    ty;
    tickRate;
    saveState;
    saved;

    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.zoom = 1;
        this.focusedOn = 0;
        this.tx = 0;
        this.ty = 0;
        this.tickRate = defaultTick;
        this.saved = false;
        
    }

    save() {
        this.saved = true;
        this.saveState = new Camera(this.width, this.height);
        this.saveState.zoom = this.zoom;
        this.saveState.focusedOn = this.focusedOn;
        this.saveState.tx = this.tx;
        this.saveState.ty = this.ty;
        this.saveState.tickRate = this.tickRate;
    }

    load() {
        if (!this.saved) {
            return;
        }
        this.width = this.saveState.width;
        this.height = this.saveState.height;
        this.zoom = this.saveState.zoom;
        this.focusedOn = this.saveState.focusedOn;
        this.tx = this.saveState.tx;
        this.ty = this.saveState.ty;
        this.tickRate = this.saveState.tickRate;
    }

    reset() {
        this.zoom = 1;
        this.focusedOn = 0;
        this.tx = 0;
        this.ty = 0;
        this.tickRate = defaultTick
    }

    center(x, y, dim) {

        this.tx = (this.width / 2) - (x * this.zoom);
        this.ty = (this.height / 2) - (y * this.zoom);
    }

    zoomTo(inUse) {
        this.focusedOn = inUse;
        if (inUse == 0) {
            this.reset();
        }

        this.updateZoom();
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
            this.reset();
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

        if (this.focusedOn == 0) {
            this.tickRate = defaultTick;
            stopAnimationWrapper(timerId);
            timerId = startAnimationWrapper(drawEpicycles, camera.tickRate);
            return;
        }
        let tRate = this.tickRate * (this.zoom / previousZoom);

        if (this.#withinRateRange(tRate)) {
            this.tickRate = tRate;
            stopAnimationWrapper(timerId);
            timerId = startAnimationWrapper(drawEpicycles, camera.tickRate);
        }
    }

    #withinRateRange(rate) {
        return (rate >= defaultTick) && (rate <= defaultTick*5);
    }
    
}

const canvas = document.getElementById("canvas-interactive");

var positionInfo = canvas.getBoundingClientRect();
var height = positionInfo.height;
var width = positionInfo.width;
var vectors;
var minX, minY, maxX, maxY, minC, maxRange;
    drawnFlag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

let running = false;
var drawLineWidth = 2;

var mouseInputs = [];
var circleCenters = [];

currT = 0;
const defaultNumOfVectors = 5;
const defaultTick = 30;
let numVectInUse = defaultNumOfVectors;
approximation = [];
breathing_room = width * .3;
drawMode = true;
centered = false;
let timerId;

let totalAvailableVectors;
let transformation;
let circleShownToggle = true;
let goalShownToggle = true;
let approxOnlyToggle = false;
let tInc = .03;

var camera = new Camera(width, height);
const ctx = canvas.getContext("2d");



let raf;

window.addEventListener("load", () => {
    console.log("Loaded: ");
    initDrawMode();
    scaleCanvas();

});

window.addEventListener('resize', () => {
    scaleCanvas();

});


swapButton = document.getElementById("btn_swap");
swapButton.addEventListener("click", swapButtonListener);
eraseButton = document.getElementById("btn_erase");
eraseButton.addEventListener("click", eraseButtonListener);
focusSlider = document.getElementById("range_focus_selector");
focusSlider.addEventListener("input", focusSliderListener);
adjustNSlider = document.getElementById("range_adjust_n");
adjustNSlider.addEventListener("input", adjustNSliderListener);


document.getElementById("show_goal_toggle").addEventListener('change', showGoalToggleListener);
document.getElementById("circle_visibility_toggle").addEventListener('change', function(){circleShownToggle = this.checked});
document.getElementById("just_approx_toggle").addEventListener('change', approxOnlyToggleListener);

// scaleCanvas();


// function animation() {
//     if (approxOnlyToggle) {
//         drawApproximation();
//     } else {
//         drawEpicycles();
//     }
// }

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
        // document.getElementById("focus_div").style.display = "none";
        // document.getElementById("circle_toggle_div").style.display = "none";
        document.getElementById("range_focus_selector").disabled = true;
        drawApproximation();
    } else {
        stopAnimationWrapper(timerId);

        // document.getElementById("focus_div").style.display = "block";
        // document.getElementById("circle_toggle_div").style.display = "block";
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
        timerId = startAnimationWrapper(drawEpicycles, camera.tickRate);
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


        if (focusSlider.value >= numVectInUse) {
            focusSlider.value = (numVectInUse - 1);

            camera.zoomTo(numVectInUse - 1);

            focusSlider.max = (numVectInUse - 1);

        }
        timerId = startAnimationWrapper(drawEpicycles, camera.tickRate);
    }


}


function eraseButtonListener() {
        ctx.clearRect(0, 0, width, height);
        mouseInputs = [];
        drawDrawHere();
        document.getElementById("btn_swap").disabled = true;
}

function swapButtonListener() {
    if (drawMode) {
        drawMode = false;


        // focusSlider.style.display = "block";

        // adjustNSlider.style.display = "block";
        initDisplayMode();
        if (approxOnlyToggle) {
            drawApproximation();
        } else {
            timerId = startAnimationWrapper(drawEpicycles, camera.tickRate);
        }
    } else {
        // window.cancelAnimationFrame(raf);

        
        stopAnimationWrapper(timerId);

        initDrawMode(); 
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
        x = (coords[i][0] + (width / 2)) * camera.zoom + camera.tx;
        y = ((height / 2) - coords[i][1]) * camera.zoom + camera.ty;
        toDraw.push([x, y]);
    }

    return toDraw;
}

function drawDrawHere() {
    let text = "draw here!";
    let size = "48";
    ctx.font =  size + "px serif";
    let w = ctx.measureText(text).width;
    let x = (width - w) / 2;
    let y = (height - parseInt(size)) / 2;
    ctx.fillStyle = "rgb(130 151 184 / 50%)";
    ctx.fillText(text, x, y);

}

function initDrawMode() {
    drawMode = true;
    mouseInputs = [];
    swapButton.value = "Finished";
    document.getElementById("erase_div").style.display="block";
    
    // document.getElementById("focus_div").style.display = "none";
    // document.getElementById("adjust_n_div").style.display = "none";
    // document.getElementById("circle_toggle_div").style.display = "none";
    // document.getElementById("approx_toggle_div").style.display = "none";

    document.getElementById("display_slider_div").style.display="none";
    document.getElementById("display_toggle_div").style.display = "none";


    document.getElementById("btn_swap").disabled = true;

    scaleCanvas();

    ctx.clearRect(0, 0, width, height);
    drawDrawHere();
    canvas.addEventListener("mousemove", draw_mouseMove);
    canvas.addEventListener("mousedown", draw_mouseDown);
    canvas.addEventListener("mouseup", draw_mouseUp);
}

function initDisplayMode() {
    ctx.clearRect(0, 0, width, height);
    camera.reset();

    approximation = [];
    currT = 0;
    swapButton.value = "Back";
    document.getElementById("erase_div").style.display="none";
    // document.getElementById("focus_div").style.display = "block";
    // document.getElementById("adjust_n_div").style.display = "block";
    // document.getElementById("circle_toggle_div").style.display = "block";
    // document.getElementById("approx_toggle_div").style.display = "block";

        document.getElementById("display_slider_div").style.display ="flex";
    document.getElementById("display_toggle_div").style.display = "flex";
    
    canvas.removeEventListener("mousemove", draw_mouseMove);
    canvas.removeEventListener("mousedown", draw_mouseDown);
    canvas.removeEventListener("mouseup", draw_mouseUp);
    scaleCanvas();


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

    transformation = new Transformation(scaledInputs);
    console.log("total available vectors = " + transformation.vectors.length);
    totalAvailableVectors = transformation.vectors.length;
    adjustNSlider.max = totalAvailableVectors;
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




    if (camera.focusedOn != 0) {
        camera.center(circleCenters[camera.focusedOn-1][0] + (width / 2), (height / 2) - circleCenters[camera.focusedOn-1][1]);
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
    // await new Promise(r => setTimeout(r, 200));


    // raf = window.requestAnimationFrame(drawEpicycles);
    
    
}

function drawNumVectors() {
    ctx.font = "48px serif";
    ctx.strokeText(numVectInUse, (width * .8), (height * .95));
}

function drawGoal() {
    if (!goalShownToggle) {
        return;
    }
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
        document.getElementById("btn_swap").disabled = false;

    }
    ctx.clearRect(0, 0, width, height);

    prevX = currX;
    prevY = currY;
    currX = getMousePos(canvas, e).x;
    currY = getMousePos(canvas, e).y;
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

function scaleCanvas() {
    let controls_container = document.getElementById("epi-controls-container");
    let epi_container = document.getElementById("epi-container");
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

    canvas.width = width = camera.width = w;
    canvas.height = height = camera.height = h;

    breathing_room = width * .3;

    if (drawMode) { // redraw users rendition
        if (mouseInputs.length == 0) {
            drawDrawHere();
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
    } else if (approxOnlyToggle) {
        drawApproximation();
    }


}

const PI_arr = [[363,81],
[360,90],[360,102],[360,114],[351,126],[339,138],[327,141],[315,147],[303,150],[291,153],[279,156],
[276,165],[279,177],[279,189],[279,201],[276,213],[276,225],[276,237],[279,249],[279,258],[282,270],
[288,282],[294,294],[291,306],[282,315],[270,315],[258,309],[252,297],[252,285],[249,273],[249,261],
[249,249],[246,237],[246,225],[243,213],[240,201],[237,189],[234,177],[234,165],[222,162],[210,162],
[198,159],[186,153],[177,162],[177,174],[177,186],[177,198],[177,210],[177,222],[177,234],[180,246],
[180,255],[186,267],[186,276],[192,285],[195,297],[192,309],[180,312],[168,309],[156,303],[147,294],
[141,282],[138,273],[138,261],[138,252],[135,240],[135,228],[135,216],[135,204],[138,192],[141,180],
[144,168],[150,156],[150,144],[141,132],[129,123],[117,123],[105,126],[93,135],[81,147],[69,153],
[57,156],[45,153],[33,147],[33,135],[39,123],[51,111],[63,99],[75,90],[87,84],[99,81],
[111,78],[123,78],[135,78],[147,84],[159,84],[171,90],[183,96],[195,105],[207,111],[219,111],
[231,114],[243,114],[255,111],[267,111],[279,108],[288,102],[300,99],[312,90],[324,78],[333,66],
[339,57],[351,63],[357,75]];

const summation_arr = [[324,135],
[312,135],[300,135],[288,135],[276,126],[264,117],[252,117],[240,117],[228,117],[216,117],[204,117],
[192,117],[180,117],[168,117],[156,117],[144,117],[159,126],[171,135],[183,141],[195,150],[207,156],
[219,165],[231,171],[243,180],[255,189],[252,198],[243,204],[231,213],[219,225],[207,234],[195,243],
[183,252],[171,264],[174,270],[186,270],[198,270],[210,270],[222,270],[234,270],[246,270],[258,270],
[264,261],[270,249],[273,237],[282,234],[294,234],[306,234],[312,240],[312,252],[312,264],[312,276],
[312,288],[312,300],[309,309],[297,309],[285,309],[273,309],[261,309],[249,309],[237,309],[225,309],
[213,309],[201,309],[189,309],[177,309],[165,309],[153,309],[141,309],[129,309],[117,309],[105,309],
[93,309],[81,309],[72,306],[72,294],[72,282],[72,270],[72,258],[78,249],[90,240],[102,231],
[111,225],[123,216],[135,207],[147,201],[159,192],[153,186],[141,180],[129,171],[117,165],[105,159],
[93,153],[81,147],[72,141],[72,129],[72,117],[72,105],[72,93],[75,84],[87,84],[99,84],
[111,84],[123,84],[135,84],[147,84],[159,84],[171,84],[183,84],[195,84],[207,84],[219,84],
[231,84],[243,84],[255,84],[267,84],[279,84],[291,84],[303,84],[315,84],[324,87],[324,99],
[324,111],[324,123]];

const squares_arr = [[10, 10],[18, 10],[26, 10],[34, 10],[42, 10],[50, 10],[58, 10],[66, 10],[74, 10],[82, 10],
[90, 10],[98, 10],[106, 10],[114, 10],[122, 10],[130, 10],[138, 10],[146, 10],[154, 10],[162, 10],
[170, 10],[178, 10],[186, 10],[194, 10],[202, 10],[210, 10],[218, 10],[226, 10],[234, 10],[242, 10],
[250, 10],[250, 18],[250, 26],[250, 34],[250, 42],[250, 50],[250, 58],[250, 66],[250, 74],[250, 82],
[250, 90],[258, 90],[266, 90],[274, 90],[282, 90],[290, 90],[298, 90],[306, 90],[314, 90],[322, 90],
[330, 90],[330, 98],[330, 106],[330, 114],[330, 122],[330, 130],[330, 138],[330, 146],[330, 154],[330, 162],
[330, 170],[338, 170],[346, 170],[354, 170],[362, 170],[370, 170],[378, 170],[386, 170],[394, 170],[402, 170],
[410, 170],[410, 178],[410, 186],[410, 194],[410, 202],[410, 210],[410, 218],[410, 226],[410, 234],[410, 242],
[410, 250],[410, 258],[410, 266],[410, 274],[410, 282],[410, 290],[410, 298],[410, 306],[410, 314],[410, 322],
[410, 330],[410, 338],[410, 346],[410, 354],[410, 362],[410, 370],[410, 378],[410, 386],[410, 394],[410, 402],
[410, 410],[402, 410],[394, 410],[386, 410],[378, 410],[370, 410],[362, 410],[354, 410],[346, 410],[338, 410],
[330, 410],[322, 410],[314, 410],[306, 410],[298, 410],[290, 410],[282, 410],[274, 410],[266, 410],[258, 410],
[250, 410],[242, 410],[234, 410],[226, 410],[218, 410],[210, 410],[202, 410],[194, 410],[186, 410],[178, 410],
[170, 410],[170, 402],[170, 394],[170, 386],[170, 378],[170, 370],[170, 362],[170, 354],[170, 346],[170, 338],
[170, 330],[170, 322],[170, 314],[170, 306],[170, 298],[170, 290],[170, 282],[170, 274],[170, 266],[170, 258],
[170, 250],[170, 242],[170, 234],[170, 226],[170, 218],[170, 210],[170, 202],[170, 194],[170, 186],[170, 178],
[170, 170],[178, 170],[186, 170],[194, 170],[202, 170],[210, 170],[218, 170],[226, 170],[234, 170],[242, 170],
[250, 170],[258, 170],[266, 170],[274, 170],[282, 170],[290, 170],[298, 170],[306, 170],[314, 170],[322, 170],
[330, 170],[330, 178],[330, 186],[330, 194],[330, 202],[330, 210],[330, 218],[330, 226],[330, 234],[330, 242],
[330, 250],[330, 258],[330, 266],[330, 274],[330, 282],[330, 290],[330, 298],[330, 306],[330, 314],[330, 322],
[330, 330],[322, 330],[314, 330],[306, 330],[298, 330],[290, 330],[282, 330],[274, 330],[266, 330],[258, 330],
[250, 330],[242, 330],[234, 330],[226, 330],[218, 330],[210, 330],[202, 330],[194, 330],[186, 330],[178, 330],
[170, 330],[162, 330],[154, 330],[146, 330],[138, 330],[130, 330],[122, 330],[114, 330],[106, 330],[98, 330],
[90, 330],[90, 322],[90, 314],[90, 306],[90, 298],[90, 290],[90, 282],[90, 274],[90, 266],[90, 258],
[90, 250],[90, 242],[90, 234],[90, 226],[90, 218],[90, 210],[90, 202],[90, 194],[90, 186],[90, 178],
[90, 170],[90, 162],[90, 154],[90, 146],[90, 138],[90, 130],[90, 122],[90, 114],[90, 106],[90, 98],
[90, 90],[98, 90],[106, 90],[114, 90],[122, 90],[130, 90],[138, 90],[146, 90],[154, 90],[162, 90],
[170, 90],[178, 90],[186, 90],[194, 90],[202, 90],[210, 90],[218, 90],[226, 90],[234, 90],[242, 90],
[250, 90],[250, 98],[250, 106],[250, 114],[250, 122],[250, 130],[250, 138],[250, 146],[250, 154],[250, 162],
[250, 170],[250, 178],[250, 186],[250, 194],[250, 202],[250, 210],[250, 218],[250, 226],[250, 234],[250, 242],
[250, 250],[242, 250],[234, 250],[226, 250],[218, 250],[210, 250],[202, 250],[194, 250],[186, 250],[178, 250],
[170, 250],[162, 250],[154, 250],[146, 250],[138, 250],[130, 250],[122, 250],[114, 250],[106, 250],[98, 250],
[90, 250],[82, 250],[74, 250],[66, 250],[58, 250],[50, 250],[42, 250],[34, 250],[26, 250],[18, 250],
[10, 250],[10, 242],[10, 234],[10, 226],[10, 218],[10, 210],[10, 202],[10, 194],[10, 186],[10, 178],
[10, 170],[10, 162],[10, 154],[10, 146],[10, 138],[10, 130],[10, 122],[10, 114],[10, 106],[10, 98],
[10, 90],[10, 82],[10, 74],[10, 66],[10, 58],[10, 50],[10, 42],[10, 34],[10, 26],[10, 18]];