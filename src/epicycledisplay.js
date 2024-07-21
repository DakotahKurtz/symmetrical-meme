import {Transformation} from './dft.js';
import {PI_arr, summation_arr, squares_arr, test_arr} from './samples.js';
import {dirty_creme, red, creme, blackish, offBlackish, light_green, dark_green, darker_green, nice_blue, artificial_blue, whiter_white} from './colors.js';



class DrawScreen {


    #drawMode = false;


    constructor() {
        this.prevX = this.prevY = this.currX = this.currY = 0;
        this.rawInputs = [];
        this.mouseInputs = [];
        
        this.sampleChosen = -1;
        this.sampleScreen = false;
        this.drawnFlag = false;
        this.cleanUp = true;

        this.points = [];
        var samples = [];
        samples.push(PI_arr, squares_arr, summation_arr, test_arr);
        
        for (let i = 0; i < samples.length; i++) {
            this.points.push(new Points(samples[i]));
        }

        document.getElementById("btn-finished").addEventListener("click", this.finishedButtonListener);
        document.getElementById("btn-erase").addEventListener("click", this.eraseButtonListener);
        document.getElementById("btn-samples").addEventListener("click", this.samplesButtonListener);
    }

    samplesButtonListener() {
        drawScreen.sampleScreen = true;
        drawScreen.removeDrawMouseListeners();

        drawScreen.initSampleScreen(-1)
        
    }

    finishedButtonListener() {
        drawScreen.setDrawMode(false);
        displayScreen.init();
    
        if (displayScreen.approxOnlyToggle) {

            displayScreen.drawApproximation();
        } else {
            displayScreen.timerId = startAnimationWrapper(displayScreen.drawEpicycles, camera.getTickRate());
        }
        
      }

    sampleScreenMouseListener(e) {
        let x = DrawScreen.getMousePos(canvas, e).x;
        let y = DrawScreen.getMousePos(canvas, e).y;

        let hovered = -1;
        let i = 0;
        for (; i < drawScreen.clickBoxes.length; i++) {
            if (x > drawScreen.clickBoxes[i][0] && x < (drawScreen.clickBoxes[i][0] + drawScreen.clickBoxes[i][2]) && y > drawScreen.clickBoxes[i][1] && y < (drawScreen.clickBoxes[i][1] + drawScreen.clickBoxes[i][2])) {
                hovered = i;
                break;
            }
        }

        drawScreen.initSampleScreen(hovered);
    }

    eraseButtonListener() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "rgb(" + primary_bg + ")";
        ctx.fillRect(0, 0, width, height);
        drawScreen.mouseInputs = [];
        drawScreen.drawDrawHere();
        document.getElementById("btn-finished").disabled = true;
    }
    
    initSampleScreen(hovered) {
        drawScreen.removeSampleScreenListeners();
        document.getElementById("control-main").style.display="none";

        this.sampleChosen = -1;
        this.clickBoxes = [];
    
        let size = .9;
        let padding = .08 * Math.min(width, height);
        let br = .03 * Math.min(width, height);
    
        let swidth = width * size;
        let sheight = height * size;
        let upperPadding, leftPadding;
        upperPadding = leftPadding = swidth * .05

        let zx = (width - swidth) / 2;
        let zy = (height - sheight) / 2;
    
        // main shadow
        ctx.clearRect(zx, zy, swidth, sheight);
        ctx.fillStyle = "rgb(" + blackish + " / 30%)";
        ctx.fillRect(zx + 10, zy + 10, swidth, sheight);
        ctx.fill();
        
        // main bg
        ctx.fillStyle = "rgb(" + sampleBgColor + ")";
        ctx.fillRect(zx, zy, swidth, sheight);
        ctx.fill();

        // draw "border"
        ctx.strokeStyle = "rgb(" + sampleBorderColor + ")";
        ctx.lineWidth = sampleOuterBorderLineWidth;
        ctx.strokeRect(zx, zy, swidth, sheight);


        let sampleDim = ((Math.min(width - leftPadding, height - upperPadding) - padding * 4) / 2) ;
        let p;
        let xt, yt;
        let col, row, index;
        col = row = index = 0;

        let buttonShadow = 10;
        let hoverShift = 3;
    
        let text = "choose sample";
        let text_size = "48";
        ctx.font =  text_size + "px serif";
        let w = ctx.measureText(text).width;
        let x = zx + padding + ((sampleDim * 2) + (padding * 2) - w) / 2;
        let y = zy + (padding  + parseInt(text_size)) / 2;

        // // let x = (width - w) / 2;
        // let x = ((sampleDim * 2 + padding * 2 - w) / 2) + zx + padding + leftPadding;
        // let y = zy + (padding + upperPadding + parseInt(text_size)) / 2; // - parseInt(size)
        ctx.fillStyle = "rgb(" + blackish + ")";
        ctx.fillText(text, x, y);

        // for each sample
        while (index < this.points.length) {
            p = this.points[index];
            p.updateAvailableArea(sampleDim, br);
            xt = leftPadding + zx + (padding * (col + 1)) + (sampleDim * col);
            yt = upperPadding + zy + (padding * (row + 1)) + (sampleDim * row);

            // draw shadow first
            ctx.fillStyle = "rgb(" + blackish + ")";
            ctx.fillRect(xt + buttonShadow, yt + buttonShadow, sampleDim, sampleDim);
            ctx.fill();

            if (index == hovered) {
                xt += hoverShift;
                yt += hoverShift;
            }

            // base canvas layer
            ctx.fillStyle = "rgb(" + sampleCanvasColor + ")";
            ctx.fillRect(xt, yt, sampleDim, sampleDim);
            ctx.fill();

            // draw points on top
            ctx.fillStyle = "rgb(" + goal_dots_color + ")";
            ctx.beginPath();


            ctx.moveTo(p.getPointX(0) + xt, p.getPointY(0) + yt);
            for (let i = 0; i < p.getLength(); i++) {
                ctx.beginPath();
                ctx.arc(p.getPointX(i) + xt, p.getPointY(i) + yt, 1, 0, 2 * Math.PI, false);
                ctx.fill();
    
            }

            ctx.lineWidth = sampleInnerBorderWidth;
            ctx.strokeStyle = "rgb(" + sampleBorderColor + ")";
            ctx.strokeRect(xt, yt, sampleDim, sampleDim);
            this.clickBoxes.push([xt, yt, sampleDim]);
    
            index++;
            col++;
            if (col % 2 == 0) {
                col = 0;
                row++;
            }
        }
    
         // arrow 
        let backArrowInc = ((padding + leftPadding) / 10);
        ctx.fillStyle = "rgb(" + arrowColor + ")";
        ctx.lineWidth = 3;
        zx += 15;
        zy += 10;
        ctx.beginPath();
        ctx.moveTo(zx + backArrowInc, zy + (backArrowInc * 4));
        ctx.lineTo(zx + (backArrowInc * 3), zy + backArrowInc);
        ctx.lineTo(zx + (backArrowInc * 3), zy + (backArrowInc * 3));
        ctx.lineTo(zx + (backArrowInc * 6), zy + (backArrowInc * 3));
        ctx.lineTo(zx + (backArrowInc * 6), zy + (backArrowInc * 5));
        ctx.lineTo(zx + (backArrowInc * 3), zy + (backArrowInc * 5));
        ctx.lineTo(zx + (backArrowInc * 3), zy + (backArrowInc * 7));
        ctx.lineTo(zx + backArrowInc, zy + (backArrowInc * 4));
        ctx.fill();

        if (hovered == drawScreen.points.length) { 
            ctx.strokeStyle = "rgb(" + red + ")";
        } else {
            ctx.strokeStyle = "rgb(" + blackish + ")";

        }
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
    
        this.clickBoxes.push([zx, zy, (backArrowInc * 7)]);
    
        // canvas.addEventListener("click", this.selectSample);
        drawScreen.addSampleScreenListeners();
    }
    
    selectSample(e) {
        let x = DrawScreen.getMousePos(canvas, e).x;
        let y = DrawScreen.getMousePos(canvas, e).y;

        console.log("x, y: " + x + ", " + y + " | length " + drawScreen.clickBoxes.length);
    
        let i = 0;
        let clicked = -1;
        for (; i < drawScreen.clickBoxes.length; i++) {
            if (x > drawScreen.clickBoxes[i][0] && x < (drawScreen.clickBoxes[i][0] + drawScreen.clickBoxes[i][2]) && y > drawScreen.clickBoxes[i][1] && y < (drawScreen.clickBoxes[i][1] + drawScreen.clickBoxes[i][2])) {
                clicked = i;
                console.log("clicked " + i);
                break;
            }
        }
    
        if (clicked != -1) {
            if (clicked < drawScreen.points.length) {
                drawScreen.sampleChosen = clicked;
                drawScreen.rawInputs = [];
                drawScreen.points[drawScreen.sampleChosen].updateAvailableArea(width, breathing_room);
    
                for (let i = 0; i < drawScreen.points[drawScreen.sampleChosen].getLength(); i++) {
                    drawScreen.rawInputs.push([drawScreen.points[drawScreen.sampleChosen].getPointX(i), drawScreen.points[drawScreen.sampleChosen].getPointY(i)]);
                }
    
                drawScreen.sampleScreen = false;
                drawScreen.removeSampleScreenListeners();
                drawScreen.finishedButtonListener();
            }
            else {
                switch (clicked) {
                    case drawScreen.points.length:
                        drawScreen.sampleScreen = false;
                        drawScreen.removeSampleScreenListeners();
                        drawScreen.initDrawMode();
                }
            }
        }
    }

    initDrawMode() {
        this.#drawMode = true;
        this.drawnFlag = false;

        camera.reset();
        this.mouseInputs = [];
        this.sampleChosen = -1;

        let main = document.getElementById("control-main");
        main.style.display="block";

        if (main.classList.contains("opacity-class")) {
            main.classList.remove("opacity-class");
        }

        let root = document.documentElement;
        root.style.setProperty('--opacity', 1);

        document.getElementById("draw-control-div").style.display="flex";
        document.getElementById("display-control-div").style.display="none";
        document.getElementById("display-options-div").style.display="none";
        document.getElementById("btn-finished").disabled = true;
        scaleEpiCanvas();
    
        drawScreen.display();
        drawScreen.addDrawMouseListeners();
    }

    display() {
        ctx.fillStyle = "rgb(" + primary_bg + ")";
        ctx.fillRect(0, 0, width, height);


        if (this.mouseInputs.length == 0) {
            this.drawDrawHere();
        } else {
            this.drawInputPoints();
        }
        if (this.sampleScreen) {
            this.initSampleScreen(this.sampleChosen);
        }
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

    draw_mouseUp() {
    
        let x = drawScreen.mouseInputs[0][0];
        let y = drawScreen.mouseInputs[0][1];
        drawScreen.mouseInputs.push([x,y]);

        drawScreen.drawInputPoints();


    this.drawnFlag = false;
}

draw_mouseMove(e) {

    if (this.drawnFlag) {
        this.prevX = this.currX;
        this.prevY = this.currY;
        this.currX = DrawScreen.getMousePos(canvas, e).x;
        this.currY = DrawScreen.getMousePos(canvas, e).y;
        drawScreen.mouseInputs.push([this.currX, this.currY]);

        ctx.beginPath();
        ctx.moveTo(this.prevX, this.prevY);
        ctx.lineTo(this.currX, this.currY);
        ctx.strokeStyle = "rgb(" + approx_color + ")";
        ctx.lineWidth = drawLineWidth;
        ctx.stroke();
        ctx.closePath();
    }
}

    draw_mouseDown(e) {
        if (!this.drawnFlag) {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = "rgb(" + primary_bg + ")";
            ctx.fillRect(0, 0, width, height);
            drawScreen.mouseInputs = [];
            document.getElementById("btn-finished").disabled = false;
        }

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "rgb(" + primary_bg + ")";
        ctx.fillRect(0, 0, width, height);

        this.prevX = this.currX;
        this.prevY = this.currY;
        this.currX = DrawScreen.getMousePos(canvas, e).x;
        this.currY = DrawScreen.getMousePos(canvas, e).y;
        this.drawnFlag = true;

        drawScreen.mouseInputs.push([this.currX, this.currY]);
    
        ctx.strokeStyle = "rgb(" + approx_color + ")";

        ctx.beginPath();
        ctx.fillRect(this.currX, this.currY, drawLineWidth, drawLineWidth);
        ctx.closePath();
    }

    static distance(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }

    clean(inputs) {
        if (inputs.length == 0) {
            return inputs;
        }
        let distance = 10;
        let minimum = 10;

            // make sure there is appropropriate space between each point
            let cX, cY, nX, nY, d;
            let copy = [];
            let totalAdded = 0;

            // console.log("input lenght: " + inputs.length);
            copy.push([inputs[0][0], inputs[0][1]]);

            for (let i = 0; i < inputs.length - 1; i++) {
                let j = i + 1;
                while (j < inputs.length - 1 && DrawScreen.distance(inputs[i][0], inputs[i][1], inputs[j][0], inputs[j][1]) < minimum) {
                    j++;
                }
                copy.push([inputs[j][0], inputs[j][1]]);
                i = (j - 1);
            }

            inputs = [];

            for (let i = 0; i < copy.length; i++) {
                inputs.push([copy[i][0], copy[i][1]]);
            }



            // console.log("copyLenght: " + copy.length);

            for (let i = 0; i < inputs.length - 1; i++) {
                // console.log("\n\n" + i + " | Current size of copy: " + copy.length);
                cX = inputs[i][0];
                cY = inputs[i][1];
                nX = inputs[i + 1][0];
                nY = inputs[i + 1][1];

                d = DrawScreen.distance(cX, cY, nX, nY);
                if (d > distance) {
                    let divisionSize = Math.floor(d / distance);
                    let xInc = (nX - cX) / divisionSize;
                    let yInc = (nY - cY) / divisionSize;
                    let divisions = divisionSize - 1;

                    let temp = [];
                    // console.log("\tadding " + divisions + " | totalAdded: " + totalAdded);
                    for (let j = 0; j <= i + totalAdded; j++) {
                        // console.log("\t" + j + " | pushing: " + copy[j][0] + ", " + copy[j][1]);
                        temp.push([copy[j][0], copy[j][1]]);
                    }
                    for (let j = 0; j < divisions; j++) {
                        cX += xInc;
                        cY += yInc;
                        temp.push([cX, cY]);
                        totalAdded += 1;
                    }
                    for (let j = (i + totalAdded + 1 - divisions) ; j < copy.length; j++) {
                        temp.push([copy[j][0], copy[j][1]]);
                    }
                    // console.log("Temp size; " + temp.length);
                    copy = [];
                    for (let j = 0; j < temp.length; j++) {
                        copy.push([temp[j][0], temp[j][1]]);
                    }

                }
                // if (i == 5) {
                //     console.log("\n\nAfter addition\n");
                //     for (let j = 0; j < copy.length; j++) {
                //         console.log(j + " | x, y: " + copy[j][0] + ", " + copy[j][1]);
                //     }
                // }


            }

            // console.log("COPY SIZE: " + copy.length);

            // fill in gaps to close shape if needed
            nX = inputs[0][0];
            nY = inputs[0][1];
            cX = inputs[inputs.length - 1][0];
            cY = inputs[inputs.length - 1][1];
            d = DrawScreen.distance(nX, nY, cX, cY);
            if (d > distance) { 
                let divisions = Math.floor(d / distance);

                let xInc = (nX - cX) / divisions;
                let yInc = (nY - cY) / divisions;
                for (let i = 0; i < divisions; i++) {
                    cX += xInc;
                    cY += yInc;
                    copy.push([cX, cY]);
                }
            }

            return copy;
    }

    drawInputPoints() {
        let points = [];
        if (this.cleanUp) {
            points = this.clean(drawScreen.mouseInputs);
        } else {
            points = drawScreen.mouseInputs;
        }

        ctx.fillStyle = "rgb(" + primary_bg + ")";
        ctx.fillRect(0, 0, width, height);
        ctx.fill();

        ctx.fillStyle = "rgb(" + nice_blue + ")";

        for (let i = 0; i < points.length; i++) {
            ctx.beginPath();
            // console.log(i + " | x, y: " + drawScreen.mouseInputs[i][0] + ", " + drawScreen.mouseInputs[i][1]);
            ctx.arc(points[i][0], points[i][1], 1, 0, 2 * Math.PI, true);
            ctx.fill();
        }
    }

    drawDrawHere() {
        let text = "draw here!";
        let size = "48";
        ctx.font =  size + "px serif";
        let w = ctx.measureText(text).width;
        let x = (width - w) / 2;
        let y = (height - parseInt(size)) / 2;
        ctx.fillStyle = "rgb(" + draw_here_color + " / 50%)";
        ctx.fillText(text, x, y);
    }

    getInputs() {
        if (this.sampleChosen == -1 && !this.cleanUp) {
            return this.mouseInputs;
        } else if (this.sampleChosen == -1) {
            return this.clean(this.mouseInputs);
        }
        else {
            return this.rawInputs;
        }
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

    addSampleScreenListeners() {
        canvas.addEventListener("mousemove", this.sampleScreenMouseListener);
        canvas.addEventListener("click", this.selectSample);
    }

    removeSampleScreenListeners() {
        canvas.removeEventListener("mousemove", this.sampleScreenMouseListener);
        canvas.removeEventListener("click", this.selectSample);
    }
    getDrawMode(){return this.#drawMode;}
    setDrawMode(b){this.#drawMode = b;}
    getMouseInputs(){return this.mouseInputs;}
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
        this.#scale = (dim - 2*breathing_room) / range;

        this.#tx = (dim - ((this.#maxX - this.#minX) * this.#scale)) / 2 - (this.#minX * this.#scale);
        this.#ty = (dim - ((this.#maxY - this.#minY) * this.#scale)) / 2 - (this.#minY * this.#scale);
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
    #isFollowing;
    static #minZoom = .4;
    static #maxZoom = 300;
    static #minTinc = .001;
    static #tIncLevel = 50;
    static #maxTickRate = 100;
    static #tickRateLevelStart = 50;
    static #tickRateLevelEnd = 100;

    constructor(currentTick) {


        this.#zoom = 1;
        this.#focusedOn = 0;
        this.#tx = 0;
        this.#ty = 0;
        this.#tickRate = currentTick;
        this.#saved = false;
        this.#isFollowing = false;
        this.tInc = default_T_Inc;
    }




    save() {
        this.#saved = true;
        this.#saveState = new Camera(this.#tickRate);
        this.#saveState.#zoom = this.#zoom;
        this.#saveState.#focusedOn = this.#focusedOn;
        this.#saveState.#tx = this.#tx;
        this.#saveState.#ty = this.#ty;
        this.#saveState.#tickRate = this.#tickRate;
        this.#saveState.tInc = this.tInc;
        this.#saveState.#isFollowing = this.#isFollowing;
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
        this.tInc = this.#saveState.tInc;
        this.#isFollowing = this.#saveState.#isFollowing;
    }

    reset() {
        this.#zoom = 1;
        this.#focusedOn = 0;
        this.#tx = 0;
        this.#ty = 0;
        this.#isFollowing = false;
        this.#tickRate = defaultTick
        this.tInc = default_T_Inc;

    }

    // zoomTo(inUse) {
    //     this.#focusedOn = inUse;
    //     console.log("in ZoomTo focused on: " + this.#focusedOn);
    //     if (inUse == 0) {
    //         this.reset();
    //         console.log("inUse == 0");
    //         return;
    //     }

    //     this.updateZoom();
    // }

    zoomIn() {
        // let previousZoom = this.#zoom;
        // this.#zoom = Math.min(this.#zoom * 1.1, 50);
        let goalZoom = this.#zoom * 1.1;
        this.updateZoom(goalZoom);
        return true;
    }

    zoomOut() {
        let goalZoom = this.#zoom / 1.1;
        this.updateZoom(goalZoom);
        return true;
    }

    updateZoom(goalZoom) {

        if ((this.#zoom >= Camera.#maxZoom && goalZoom >= Camera.#maxZoom) || (this.#zoom <= Camera.#minZoom && goalZoom <= Camera.#minZoom)) {
            return;
        }

        stopAnimationWrapper(displayScreen.timerId);


        this.#zoom = Math.max(Math.min(goalZoom, Camera.#maxZoom), Camera.#minZoom);

        // calculate tInc
        let tInc;
        if (this.#zoom <= 1) {
            tInc = default_T_Inc;
        } else if (1 < this.#zoom && this.#zoom <= Camera.#tIncLevel) {
            let slope = (default_T_Inc - Camera.#minTinc) / (1 - Camera.#tIncLevel);
            tInc = (slope * this.#zoom) - (slope * Camera.#tIncLevel) + Camera.#minTinc;
        } else {
            console.log("Zoom too BIG for TINC");
            tInc = Camera.#minTinc;
        }

        this.tInc = tInc;


        // calculate tickRate
        let tickRate;
        if (this.#zoom <= Camera.#tickRateLevelStart) {
            tickRate = defaultTick;
        } else if (Camera.#tickRateLevelStart < this.#zoom && this.#zoom <= Camera.#tickRateLevelEnd) {
            let slope = (defaultTick - Camera.#maxTickRate) / (Camera.#tickRateLevelStart - Camera.#tickRateLevelEnd);
            tickRate = slope * this.#zoom - slope * Camera.#tickRateLevelStart + defaultTick;
        } else {
            console.log("Zoom too BIG for TickRate");

            tickRate = Camera.#maxTickRate;
        }

        this.#tickRate = tickRate;

        console.log("Zoom: " + this.#zoom + " | TINC: " + tInc + " | tickRate: " + tickRate);


        displayScreen.timerId = startAnimationWrapper(displayScreen.drawEpicycles, this.#tickRate);
    }



    center(x, y, dim) {

                // if (camera.getFocusedOn() != 0) {
        //     camera.center(circleCenters[camera.getFocusedOn() - 1][0] + (width / 2), (height / 2) - circleCenters[camera.getFocusedOn() - 1][1]);
        // }
        // camera.center((width / 2), (height / 2));
        x += (width / 2);
        y = (height / 2) - y;

        this.#tx = (width / 2) - (x * this.#zoom);
        this.#ty = (height / 2) - (y * this.#zoom);
    }

    #withinRateRange(rate) {
        return (rate >= defaultTick) && (rate <= defaultTick*8);
    }

    getTx() {return this.#tx;}
    getTy() {return this.#ty;}
    getZoom() {return this.#zoom}
    getFocusedOn() {return this.#focusedOn}
    setFocusedOn(focused) {this.#focusedOn = focused;}

    getTickRate() {return this.#tickRate}
    setTickRate(tickRate) {this.#tickRate = tickRate;} 
    setIsFollowing(b, focusedOn) {
        this.#isFollowing = b;
        let previousZoom = this.#zoom;

        if (b) {
            this.#focusedOn = focusedOn;
            // calculate new zoom
            let dim = displayScreen.vectors[focusedOn].radius * 2;
            let spacing = width * .35;

            let goal = (width - 2 * spacing) / dim;
            this.updateZoom(goal);

            // while (this.#zoom <= goal && this.#zoom <= 50) {
            //     this.zoomIn();
            // }

            // this.#zoom = Math.min((width - 2 * spacing) / dim, 50);
            // this.updateZoom(previousZoom);

        } else {
            this.#focusedOn = 0;
            this.updateZoom(1);
            // this.#zoom = 1;
            // this.tInc = default_T_Inc;
            // this.tickRate = defaultTick;
        }
    }
    isFollowing() {return this.#isFollowing;}
}

class DisplayScreen {

    constructor() {
        this.circleShownToggle = true;
        this.goalShownToggle = true;
        this.approxOnlyToggle = false;
    }

    init() {
        this.approximation = [];
        this.numVectInUse = defaultNumOfVectors;
        this.currT = 0;

        this.vectors = [];
        this.scaledInputs = [];
        this.running = false;
        
        document.getElementById("draw-control-div").style.display="none";
        let main = document.getElementById("control-main");
        main.style.display="block";
        document.getElementById("display-control-div").style.display="flex";
        document.getElementById("display-options-div").style.display="flex";


        let root = document.documentElement;
        root.style.setProperty('--opacity', defaultOpacity);
        if (!(main.classList.contains("opacity-class"))) {
            main.classList.add("opacity-class");

        }

        if (!(main.classList.contains("opacity-anim"))) {
            main.classList.add("opacity-anim");
        }

        scaleEpiCanvas();
    
        drawScreen.removeDrawMouseListeners();
        camera.reset();

        this.scaledInputs = this.canvasToCoords(drawScreen.getInputs());

        var minX, minY, maxX, maxY;
        minX = minY = Number.MAX_VALUE;
        maxX = maxY = Number.MIN_VALUE;
    
        for (let i = 0; i < this.scaledInputs.length; i++) {
            minX = Math.min(minX, this.scaledInputs[i][0]);
            minY = Math.min(minY, this.scaledInputs[i][1]);
            maxX = Math.max(maxX, this.scaledInputs[i][0]);
            maxY = Math.max(maxY, this.scaledInputs[i][1]);
        }
    
        this.transformation = new Transformation(this.scaledInputs);
        // adjustNSlider.max = Math.min(this.transformation.vectors.length, maxNumberOfVectors);
        this.numVectInUse = Math.min(this.transformation.size(), defaultNumOfVectors);
        // adjustNSlider.value = this.numVectInUse;
        this.vectors = this.transformation.getVectors(this.numVectInUse);

        scaleEpiCanvas();

    }

    drawApproximation() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "rgb(" + primary_bg + ")";
        ctx.fillRect(0, 0, height, width);
        let approx = [];
        let endPoints = [];
        let t = 0;
    
        while (t <= (2*Math.PI + camera.tInc)) {
            endPoints = this.getVectorEndpoints(t);
            approx.push([endPoints[endPoints.length - 1][0], endPoints[endPoints.length - 1][1]]);
            t += camera.tInc;
        }
    
        this.drawGoal();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgb(" + approx_color + ")";
    
        ctx.beginPath();
        ctx.moveTo(this.coordsToDrawX(approx[0][0]), this.coordsToDrawY(approx[0][1]));
    
        for (let i = 1; i < approx.length; i++) {
    
            ctx.lineTo(this.coordsToDrawX(approx[i][0]), this.coordsToDrawY(approx[i][1]));
        }
        ctx.stroke();
    
        this.drawNumVectors();
    }
    
    drawEpicycles() { 
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "rgb(" + primary_bg + ")";
        ctx.fillRect(0, 0, width, height);
    
    
        // calculate the centers of every circle
        let circleCenters = displayScreen.getVectorEndpoints(displayScreen.currT);
    
        if (camera.isFollowing()) {
            camera.center(circleCenters[camera.getFocusedOn()][0], circleCenters[camera.getFocusedOn()][1]);
        } else {
            camera.center(0, 0);
        }

        displayScreen.drawGoal();   

    
        if (displayScreen.circleShownToggle) {
            ctx.lineWidth = circleUnfocusedLineWidth;
            ctx.strokeStyle = "rgb(" + circle_color + ")";

            if (camera.getFocusedOn() != 0) {
                ctx.strokeStyle = "rgb(" + circle_color + " / 20%)";
                ctx.lineWidth = circleBehindFocusLineWidth;
            }

            ctx.beginPath();
            ctx.arc(displayScreen.coordsToDrawX(0), displayScreen.coordsToDrawY(0), displayScreen.scale(displayScreen.vectors[0].radius), 0, 2*Math.PI, true);
            ctx.stroke();
    
            // draw each circle
            for (let i = 1; i < circleCenters.length; i++) {
                if (i == camera.getFocusedOn()) {
                    ctx.lineWidth = circleFocusedLineWidth;
                    ctx.strokeStyle = "rgb(" + circle_focus_color + ")";
                }
                else if (i < camera.getFocusedOn() ) {
                    ctx.strokeStyle = "rgb(" + circle_color + " / 20%)";
                    ctx.lineWidth = circleBehindFocusLineWidth;
                } else {
                    ctx.strokeStyle = "rgb(" + circle_color + ")";
                    ctx.lineWidth = circleUnfocusedLineWidth;
                }
                ctx.beginPath();
                ctx.arc(displayScreen.coordsToDrawX(circleCenters[i-1][0]), displayScreen.coordsToDrawY(circleCenters[i-1][1]), displayScreen.scale(displayScreen.vectors[i].radius), 0, 2*Math.PI, true);
                ctx.stroke();
            }
        }
    
        // draw radial lines for each circle
        ctx.strokeStyle = "rgb(" + vector_color + ")";
        ctx.lineWidth = vectorLineWidth;
        ctx.beginPath();
        ctx.moveTo(displayScreen.coordsToDrawX(0), displayScreen.coordsToDrawY(0));
    
        for (let i = 0; i < circleCenters.length; i++) {
            ctx.lineTo(displayScreen.coordsToDrawX(circleCenters[i][0]), displayScreen.coordsToDrawY(circleCenters[i][1]));
        }
        ctx.stroke();
    
        // add final value of fourier transform at currT
        displayScreen.approximation.push([circleCenters[circleCenters.length - 1][0], circleCenters[circleCenters.length-1][1], displayScreen.currT]);
        // let timeShown = displayScreen.approximation[displayScreen.numVectInUse - 1][2] - displayScreen.approximation[0][2];
        let timeShown = displayScreen.approximation[displayScreen.approximation.length - 1][2] - displayScreen.approximation[0][2];

        while ( timeShown > ((Math.PI * 2) + .1)) {
            displayScreen.approximation.shift();
            timeShown = displayScreen.approximation[displayScreen.approximation.length - 1][2] - displayScreen.approximation[0][2];
            // console.log("timeShown: " + timeShown + ", num: " + displayScreen.approximation.length);
        }
    
        // draw actual approximation
        // let approxLineWidth = Math.min((width * .01) * camera.getZoom(), (width * .05));
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgb(" + approx_color + ")";
        ctx.beginPath(displayScreen.coordsToDrawX(displayScreen.approximation[0][0]), displayScreen.coordsToDrawY(displayScreen.approximation[0][1]));
    
        for (let i = 1; i < displayScreen.approximation.length; i++) {
            ctx.lineTo(displayScreen.coordsToDrawX(displayScreen.approximation[i][0]), displayScreen.coordsToDrawY(displayScreen.approximation[i][1]));
        }
        ctx.stroke();
    
        // draw circle showing current x,y value of fourier transform at currT
        ctx.fillStyle = "rgb(" + drawing_approx_color + ")";
        ctx.beginPath();
        ctx.arc(displayScreen.coordsToDrawX(circleCenters[circleCenters.length - 1][0]), displayScreen.coordsToDrawY(circleCenters[circleCenters.length - 1][1]), 3, 0, 2*Math.PI, true);
        ctx.fill();
    
        displayScreen.drawNumVectors();
    
        displayScreen.currT += camera.tInc;
    }
    
    drawNumVectors() {

        ctx.fillStyle = "rgb(" + nice_blue + ")";
        ctx.font = (width * .07) + "px Georgia";
        ctx.save();
        let t1 = this.numVectInUse.toString();
        let m1 = ctx.measureText(t1);
        let h1 = m1.actualBoundingBoxAscent + m1.actualBoundingBoxDescent;
        let w1 = m1.width;

        ctx.fillStyle = "rgb(" + red + ")";
        ctx.font = (width * .035) + "px Monospace";
        ctx.save();
        let t2 = " OF ";
        let m2 = ctx.measureText(t2);
        let h2 = m2.actualBoundingBoxAscent + m2.actualBoundingBoxDescent;
        let w2 = m2.width;

        ctx.fillStyle = "rgb(" + nice_blue + ")";
        ctx.font = (width * .07) + "px Georgia";
        let t3 = Math.min(this.transformation.size(), maxNumberOfVectors).toString();
        let m3 = ctx.measureText(t3);
        let h3 = m3.actualBoundingBoxAscent + m3.actualBoundingBoxDescent;
        let w3 = m3.width;


        let paddW = (width * .97);
        let paddH = (height * .02);

        ctx.fillText(t3, paddW - w3, paddH + h3);
        ctx.restore();
        ctx.fillText(t2, paddW - w3 - w2, paddH + h3);
        ctx.restore();
        ctx.fillText(t1, paddW - w3 - w2 - w1, paddH + h3);

    }
    
    drawGoal() {
        if (!this.goalShownToggle) {
            return;
        }
    
        ctx.fillStyle = "rgb(" + goal_dots_color + " / 50%)";
        // let r = Math.min(width * .025 * camera.getZoom(), width * .07 );
        let r = Math.max(2, Math.min(width * .07, width * .003 * camera.getZoom()));
    
        for (let i = 0; i < this.scaledInputs.length; i++) {
            ctx.beginPath();
    
            let x = this.coordsToDrawX(this.scaledInputs[i][0]);
            let y = this.coordsToDrawY(this.scaledInputs[i][1]);
            ctx.arc(x, y, r, 0, 2*Math.PI, false);
            ctx.fill();
        }
    }
    
    getCoords() {
        let coords = [];
        let x = this.vectors[0].radius * Math.cos(this.currT * this.vectors[0].scaledIndex + this.vectors[0].offset);
        let y = this.vectors[0].radius * Math.sin(this.currT * this.vectors[0].scaledIndex + this.vectors[0].offset);
        coords.push([x, y]);
    
        for (let i = 1; i < this.numVectInUse; i++) {
            x = coords[i - 1][0] + this.vectors[i].radius * Math.cos(this.currT * this.vectors[i].scaledIndex + this.vectors[i].offset);
            y = coords[i - 1][1] + this.vectors[i].radius * Math.sin(this.currT * this.vectors[i].scaledIndex + this.vectors[i].offset);
            
            coords.push([x, y]);
        }
    
        return coords;
    }

    setNumVectorsInUse(num) {
        this.numVectInUse = Math.min(Math.max(2, num), Math.min(maxNumberOfVectors, this.transformation.size()));
        this.vectors = this.transformation.getVectors(this.numVectInUse);

        if (this.numVectInUse <= camera.getFocusedOn()) {
            camera.setFocusedOn(this.numVectInUse - 1);
        }
    }
    
    getVectorEndpoints(time) {
        let endpoints = [];
        let x, y;
        for (let i = 0; i < this.vectors.length; i++) {
            if (i == 0) {
                x = this.vectors[0].radius * Math.cos(time * this.vectors[0].scaledIndex + this.vectors[0].offset);
                y = this.vectors[0].radius * Math.sin(time * this.vectors[0].scaledIndex + this.vectors[0].offset);
                endpoints.push([x, y]);
            } else {
                
                x = endpoints[i - 1][0] + this.vectors[i].radius * Math.cos(time * this.vectors[i].scaledIndex + this.vectors[i].offset);
                y = endpoints[i - 1][1] + this.vectors[i].radius * Math.sin(time * this.vectors[i].scaledIndex + this.vectors[i].offset);
    
                endpoints.push([x, y]);
            }
        } 
        return endpoints;
    }
    
    scale(radius) {
        return radius * camera.getZoom();
    }
    
    
    
    coordsToDrawX(x) {
    let coord = x + ((width / (2)));
    
            return coord * camera.getZoom() + camera.getTx();
        
    }
    
    coordsToDrawY(y) {
        let coord = (height / 2) - y;
        return coord * camera.getZoom()+ camera.getTy();
            // return ((height / (2)) / 1) - y;
    }

    canvasToCoords(inputs) {
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
}



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

const canvas = document.getElementById("canvas-interactive");
const defaultNumOfVectors = 5;
const defaultTick = 20;
const ctx = canvas.getContext("2d");
const drawLineWidth = 2;
const default_T_Inc  = .01;
const maxNumberOfVectors = 300;

// const dirty_creme = "#F5F4E4";
// const red = "#FA7070";
// const creme = "#FEFDED";
// const blackish = "#363537";
// const light_green = "#C6EBC5";
// const dark_green = "#A1C398";
// const darker_green = "#426A5A";
// const nice_blue = "#3F7CAC";



const circleBehindFocusLineWidth = 1;
const circleUnfocusedLineWidth = 1;
const circleFocusedLineWidth = 2;
const vectorLineWidth = 2;
const canvasTextWidth = 3;

const sampleInnerBorderWidth = 3;
const sampleOuterBorderLineWidth = 4;

let primary_bg = creme;
let approx_color = nice_blue;
let circle_color = blackish;
let circle_focus_color = red;
let vector_color = light_green;
let goal_dots_color = offBlackish;
let draw_here_color = offBlackish;
let drawing_approx_color = artificial_blue;

let sampleBorderColor = red;
let sampleBgColor = nice_blue;
let sampleCanvasColor = dirty_creme;
let arrowColor = offBlackish;

let root = document.documentElement;
let defaultOpacity = (getComputedStyle(root).getPropertyValue("--opacity"));

let minX, minY;

let breathing_room;

function main() {
    // initialize global variables


    var positionInfo = canvas.getBoundingClientRect();
    height = positionInfo.height;
    width = positionInfo.width;
    breathing_room = width * .3;
}


var height;
var width;

main();

var drawScreen = new DrawScreen();
var camera = new Camera(defaultTick);
var displayScreen = new DisplayScreen();

document.getElementById("clean-up-toggle").addEventListener("change", cleanUpToggleListener);
document.getElementById("epi-controls-container").addEventListener("animationend", controlAnimListener);

// adjustNSlider = document.getElementById("range_adjust_n");
// adjustNSlider.addEventListener("input", adjustNSliderListener);


// window.addEventListener('resize', scaleEpiCanvas);
// window.addEventListener("load", epiLoadListener);

document.getElementById("btn-back").addEventListener("click", backButtonListener);
document.getElementById("show-goal-toggle").addEventListener('change', showGoalToggleListener);
document.getElementById("just-approx-toggle").addEventListener('change', approxOnlyToggleListener);
document.getElementById("circle-visibility-toggle").addEventListener('change', function(){displayScreen.circleShownToggle = this.checked});

document.getElementById("follow-toggle").addEventListener('change', followToggleListener);

document.getElementById("min-btn").addEventListener("click", anim);

// const identity = function (x) { return x; };
// const linear = function (x) { return Math.max(x * .7, ClickAndHold.SHORTEST_TIMEOUT); };

new LongPressHandler(document.getElementById("zoom-in"), () => {camera.zoomIn()}, LongPressHandler.linear);
new LongPressHandler(document.getElementById("zoom-out"), () => {camera.zoomOut()}, LongPressHandler.linear);
new LongPressHandler(document.getElementById("add-vector"), addVectorListener, LongPressHandler.linear);
new LongPressHandler(document.getElementById("remove-vector"), removeVectorListener, LongPressHandler.linear);

function addVectorListener(change) {
    updateNumVectors(displayScreen.numVectInUse + change);
}

function removeVectorListener(change) {
    updateNumVectors(displayScreen.numVectInUse - change);
}

function updateNumVectors(num) {
    if (displayScreen.approxOnlyToggle) {

        displayScreen.setNumVectorsInUse(num);
        displayScreen.drawApproximation();
    } else {

        // stopAnimationWrapper(displayScreen.timerId);

        displayScreen.setNumVectorsInUse(num);

        // displayScreen.timerId = startAnimationWrapper(displayScreen.drawEpicycles, camera.getTickRate());
    }
}

function followToggleListener() {
    camera.setIsFollowing(this.checked, displayScreen.numVectInUse - 1);
}

function cleanUpToggleListener() {
    drawScreen.cleanUp = !drawScreen.cleanUp;
    if (drawScreen.getDrawMode()) {
        drawScreen.display();
    }
}

function controlAnimListener() {
    let container = document.getElementById("control-main");
    console.log("animation End");
    let value = container.classList.contains("slide-away-class") ? "show" : "hide";
    document.getElementById("min-btn").value = value;
    container.classList.toggle("opacity-anim");
    scaleEpiCanvas();
}

function anim() {
    console.log("Clicked");
    let tx, ty;
    let container = document.getElementById("control-main");

    container.classList.toggle("opacity-anim");
    let controls = document.getElementById("epi-controls-container");
    let btn = document.getElementById("min-btn");
    style = window.getComputedStyle(btn);

    let btnW = parseFloat(style.width);
    let btnH = parseFloat(style.height);
    let containerTop = parseFloat(container.style.top);
    let containerLeft = parseFloat(container.style.left);
    // let containerTop = 90 * btnH;
    // let containerLeft = 5 * btnW;

    console.log("Anim");

    tx = width - btnW - containerLeft - parseFloat(style.getPropertyValue('border-right-width'));
    ty = height - btnH - containerTop;

    // convert to percentages
    // style = window.getComputedStyle(container);
    // let pX = (tx / parseFloat(style.width)) * 100;
    // let pY = (ty / parseFloat(style.height)) * 100;
    // console.log("tx,y: " + tx + ", " + ty + " | as percentage x, y: " + pX + ", " + pY);

    // let root = document.documentElement;
    // root.style.setProperty('--translateX', pX + "%");
    // root.style.setProperty('--translateY', pY + "%");

    root.style.setProperty('--translateX', tx + "px");
    root.style.setProperty('--translateY', ty + "px");

    if (controls.classList.contains('minimize-class')) {
        controls.classList.remove('minimize-class');
        container.classList.remove("slide-away-class");
        controls.classList.add("un-minimize-class");
        container.classList.add("slide-back-class");
    } else {
        controls.classList.add('minimize-class');
        container.classList.add("slide-away-class");
        controls.classList.remove("un-minimize-class");
        container.classList.remove("slide-back-class");
    }


}

export function epiLoadListener() {
    drawScreen.initDrawMode();
}

function backButtonListener() {
    stopAnimationWrapper(displayScreen.timerId);
    drawScreen.initDrawMode();
    document.getElementById("follow-toggle").checked = false;

}



function showGoalToggleListener() {
    displayScreen.goalShownToggle = this.checked;

    if (displayScreen.approxOnlyToggle) {
        displayScreen.drawApproximation();
    }
}

function approxOnlyToggleListener() {
    displayScreen.approxOnlyToggle = this.checked;

    if (displayScreen.approxOnlyToggle) {
        stopAnimationWrapper(displayScreen.timerId);
        camera.save();
        camera.reset();
        document.getElementById("follow-toggle").disabled=true;
        displayScreen.drawApproximation();
    } else {
        stopAnimationWrapper(displayScreen.timerId);

        camera.load();
        document.getElementById("follow-toggle").disabled=false;

        displayScreen.setNumVectorsInUse(displayScreen.numVectInUse);

        displayScreen.timerId = startAnimationWrapper(displayScreen.drawEpicycles, camera.getTickRate());
    }
}



function startAnimationWrapper(fx, tRate) {
    
    if (!displayScreen.running) {
        displayScreen.running = true;
        return setInterval(fx, tRate);
    }
    return displayScreen.timerId;
}

function stopAnimationWrapper(t) {
    clearInterval(t);
    displayScreen.running = false;
}



export function scaleEpiCanvas() {
    let vp_height = window.innerHeight|| document.documentElement.clientHeight|| 
    document.body.clientHeight;
    let mainWidth = parseFloat(window.getComputedStyle(document.getElementById("main")).width);
    
    // console.log("VPheight, mainWidth: " + vp_height + ", " + mainWidth);
        if (!(document.getElementById("aside").style.display == "none")) {
        let aside_w = document.getElementById("aside").offsetWidth;
        mainWidth -= aside_w;
    }
    let spacing = 50;
    let w, h;
    if (vp_height < mainWidth) {
        w = h = vp_height - spacing;

    } else {
        w = h = mainWidth - spacing;
    }

    let epi_container = document.getElementById("epi-container");
    epi_container.style.width = w + "px";
    epi_container.style.height = h + "px";

    canvas.width = canvas.height = height = width = w;
    breathing_room = width * .2;

    if (!drawScreen.sampleScreen) {
        let controlsContainer = document.getElementById("control-main");
        // console.log("scaleCanvas - adjusting control-main");
        let style = window.getComputedStyle(controlsContainer);
        let controlHeight = parseFloat(style.height);
        let newX = width * .02;
        let newY = height - newX - controlHeight;

        // console.log("\n\nleft/top: " + newX + "/" + newY);
        if ((document.getElementById("min-btn").value === "show")) {
        
            let btn = document.getElementById("min-btn");
            style = window.getComputedStyle(btn);
        
            let transX = parseFloat(getComputedStyle(root).getPropertyValue("--translateX"));
            let transY = parseFloat(getComputedStyle(root).getPropertyValue("--translateY"));

            let realButtonX = parseFloat(newX) + transX;
            let realButtonY = parseFloat(newY) + transY;

            let btnW = parseFloat(style.width);
            let btnH = parseFloat(style.height);
            let goalX = width - btnW;
            let goalY = width - btnH;

            newX = newX + (goalX - realButtonX);
            newY = newY + (goalY - realButtonY);
        }

        controlsContainer.style.left = newX + "px";
        controlsContainer.style.top = newY + "px";
    }

    if (drawScreen.getDrawMode()) { // redraw users rendition
        drawScreen.display();
    } else if (displayScreen.approxOnlyToggle) {
        displayScreen.drawApproximation();
    }
}

// function linearFireRate(shortest_timeout) {
    //         this.shortest_timeout = shortest_timeout;
    //         let fx = (x) => {
    //             return Math.max(x * .7, this.shortest_timeout);
    //         };
    //         return { shortest_timeout, fx };
        
    // }
    
    // function longPressClickable(clickable, callback, fireRateFx) {
    //         this.SHORTEST_TIMEOUT = fireRateFx.shortest_timeout;
    //         this.target = clickable;
    //         this.callback = callback;
    //         this.isHeld = false;
    //         this.activeHoldTimeoutId = null;
    //         this.fireRateFx = fireRateFx.fx;
    //         this.defaultFireRate = 1000;
    //         this.currentFireRate = this.defaultFireRate;
    //         this.change = 1;
    
    
    
    //         const onTouch = () => {
    //             this.isHeld = true;
    //             this.callback(this.change);
    //             this.activeHoldTimeoutId = fireCallback();
    //         };
    
    //         const fireCallback = () => {
    //             let x = setTimeout(() => {
    //                 if (this.isHeld) {
    //                     this.callback(this.change);
    //                     this.currentFireRate = this.fireRateFx(this.currentFireRate);
    
    //                     if (this.currentFireRate == LongPressHandler.SHORTEST_TIMEOUT) {
    //                         this.change = Math.min(this.change + 1, 10);
    //                     }
    //                     return fireCallback();
    //                 } else {
    //                     return;
    //                 }
    //             }, this.currentFireRate);
    //         };
    
    //         onRelease = () => {
    //             this.isHeld = false;
    //             this.currentFireRate = this.defaultFireRate;
    //             this.change = 1;
    //             clearTimeout(this.activeHoldTimeoutId);
    //         };
    
    //         const identity = (x) => {
    //             return x;
    //         };
    
    //         const linear = (x) => {
    //             return Math.max(x * .7, this.SHORTEST_TIMEOUT);
    //         };
    
    //         ["mousedown", "touchstart"].forEach(type => {
    //             this.target.addEventListener(type, onTouch.bind(this));
    //         });
    
    //         ["mouseup", "mouseleave", "mouseout", "touchend", "touchcancel"].forEach(type => {
    //             this.target.addEventListener(type, onRelease.bind(this));
    //         });
    
    //         return { identity, linear };
        
    // }