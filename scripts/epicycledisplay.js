

class DrawScreen {

    prevX;
    prevY;
    currX;
    currY;
    drawnFlag = false;
    rawInputs;
    mouseInputs;
    sampleChosen;
    sampleScreen;
    clickBoxes;
    points;
    #drawMode = false;

    
    constructor() {
        this.prevX = this.prevY = this.currX = this.currY = 0;
        this.rawInputs = [];
        this.mouseInputs = [];
        this.sampleChosen = -1;
        this.sampleScreen = false;

        this.points = [];
        var samples = [];
        samples.push(PI_arr, squares_arr, summation_arr, test_arr);
        
        for (let i = 0; i < samples.length; i++) {
            this.points.push(new Points(samples[i]));
        }

        document.getElementById("btn_finished").addEventListener("click", this.finishedButtonListener);
        document.getElementById("btn_erase").addEventListener("click", this.eraseButtonListener);
        document.getElementById("btn_samples").addEventListener("click", this.samplesButtonListener);
    }

    samplesButtonListener() {
        drawScreen.sampleScreen = true;
        drawScreen.removeDrawMouseListeners();
        drawScreen.initSampleScreen()
    }

    finishedButtonListener() {

        drawScreen.setDrawMode(false);
        // scaledInputs = canvasToCoords(drawScreen.getInputs());

        displayScreen.init();
    
        if (displayScreen.approxOnlyToggle) {
            displayScreen.drawApproximation();
        } else {
            displayScreen.timerId = startAnimationWrapper(displayScreen.drawEpicycles, camera.getTickRate());
        }
        
      }

    eraseButtonListener() {
        ctx.clearRect(0, 0, width, height);
        drawScreen.mouseInputs = [];
        drawScreen.drawDrawHere();
        document.getElementById("btn_finished").disabled = true;
    }
    
    initSampleScreen() {
        console.log("init sample screen");
        canvas.removeEventListener("click", this.selectSample);
    
        this.sampleChosen = -1;
    
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
    
       this.clickBoxes = [];
    
        let p;
        let xt, yt;
        let col, row, index;
        col = row = index = 0;
    
        while (index < this.points.length) {
            p = this.points[index];
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
            this.clickBoxes.push([xt, yt, sampleDim]);
    
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
    
        this.clickBoxes.push([zx, zy, (backArrowInc * 7)]);
    
        canvas.addEventListener("click", this.selectSample);
    
    }
    
    selectSample(e) {
        console.log("Select sample attempt");
        let x = DrawScreen.getMousePos(canvas, e).x;
        let y = DrawScreen.getMousePos(canvas, e).y;
    
        console.log("Clicked on Sample Screen: " + x + ", " + y);
        console.log("click-boxes size: " + drawScreen.clickBoxes.length);
        for (let i = 0; i < drawScreen.clickBoxes.length; i++) {
            console.log(i + " | " + drawScreen.clickBoxes[i][0] + ", " + drawScreen.clickBoxes[i][1] + ", " + drawScreen.clickBoxes[i][2]);
        }
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
    
                console.log("clicked sample - REMOVING click listener");
                drawScreen.sampleScreen = false;
                canvas.removeEventListener("click", drawScreen.selectSample);
                drawScreen.finishedButtonListener();
            }
            else {
                switch (clicked) {
                    case drawScreen.points.length:
                        console.log("clicked sample - REMOVING click listener");
                        drawScreen.sampleScreen = false;
                        canvas.removeEventListener("click", drawScreen.selectSample);
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
    
        document.getElementById("draw_control_div").style.display="flex";
        document.getElementById("draw_options_div").style.display="flex";
    
        document.getElementById("display_slider_div").style.display="none";
        document.getElementById("display_toggle_div").style.display = "none";
        document.getElementById("display_control_div").style.display="none";
        document.getElementById("btn_finished").disabled = true;
    
        scaleCanvas();
    
        ctx.clearRect(0, 0, width, height);
        this.drawDrawHere();
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
            drawScreen.mouseInputs = [];
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
            drawScreen.mouseInputs.push([this.currX, this.currY]);
    }
    
    draw_mouseUp() {
    
        if (document.getElementById("closed_form_toggle").checked) { // trying to draw a closed shape
            let x = drawScreen.mouseInputs[0][0];
            let y = drawScreen.mouseInputs[0][1];
            drawScreen.mouseInputs.push([x,y]);
            ctx.beginPath();
            ctx.moveTo(this.currX, this.currY);
            ctx.lineTo(x,y);
            ctx.stroke();
        } else {
            // manual reverse
            let rev = [];
            for (let i = 0; i < drawScreen.mouseInputs.length; i++) {
                rev.push([drawScreen.mouseInputs[drawScreen.mouseInputs.length - 1 - i][0], drawScreen.mouseInputs[drawScreen.mouseInputs.length - 1 - i][1]]);
            }
            drawScreen.mouseInputs = drawScreen.mouseInputs.concat(rev);
        }
    
    
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
    getInputs() {
        if (this.sampleChosen == -1) {
            return this.mouseInputs;
        } else {
            return this.rawInputs;
        }
    }
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
            stopAnimationWrapper(displayScreen.timerId);
            displayScreen.timerId = startAnimationWrapper(displayScreen.drawEpicycles, this.#tickRate);
            return;
        }
        let tRate = this.#tickRate * (this.#zoom / previousZoom);

        if (this.#withinRateRange(tRate)) {
            this.#tickRate = tRate;
            stopAnimationWrapper(displayScreen.timerId);
            displayScreen.timerId = startAnimationWrapper(displayScreen.drawEpicycles, this.#tickRate);
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

class DisplayScreen {

    approximation;
    numVectInUse;
    currT;
    vectors;
    breathing_room;
    timerId;
    running;
    transformation;
    circleShownToggle;
    goalShownToggle;
    approxOnlyToggle;
    scaledInputs;

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
        this.breathing_room = width * .3;
        this.running = false;
        
        document.getElementById("draw_control_div").style.display="none";
        document.getElementById("draw_options_div").style.display="none";
    
        document.getElementById("display_slider_div").style.display ="flex";
        document.getElementById("display_toggle_div").style.display = "flex";
        document.getElementById("display_control_div").style.display="flex";
    
        drawScreen.removeDrawMouseListeners();
        scaleCanvas();
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
        adjustNSlider.max = Math.min(this.transformation.vectors.length, maxNumberOfVectors);
        this.numVectInUse = Math.min(this.transformation.vectors.length, defaultNumOfVectors);
        adjustNSlider.value = this.numVectInUse;
        focusSlider.max = this.numVectInUse - 1;
        focusSlider.value = 0;
        this.vectors = this.transformation.getVectors(this.numVectInUse);

    }

    drawApproximation() {
        ctx.clearRect(0, 0, width, height);
        let approx = [];
        let endPoints = [];
        let t = 0;
    
        while (t <= (2*Math.PI + tInc)) {
            endPoints = this.getVectorEndpoints(t);
            approx.push([endPoints[endPoints.length - 1][0], endPoints[endPoints.length - 1][1]]);
            t += tInc;
        }
    
        this.drawGoal();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#aaffd3";
        ctx.setLineDash([]);
    
        ctx.beginPath();
        ctx.moveTo(coordsToDrawX(approx[0][0]), coordsToDrawY(approx[0][1]));
    
        for (let i = 1; i < approx.length; i++) {
    
            ctx.lineTo(coordsToDrawX(approx[i][0]), coordsToDrawY(approx[i][1]));
        }
        ctx.stroke();
    
        this.drawNumVectors();
    }
    
    drawEpicycles() { 
    
        ctx.clearRect(0, 0, width, height);
    
        displayScreen.drawGoal();
    
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000000";
        ctx.setLineDash([]);
    
    
        // calculate the centers of every circle
        let circleCenters = displayScreen.getVectorEndpoints(displayScreen.currT);
    
    
    
    
        if (camera.getFocusedOn() != 0) {
            camera.center(circleCenters[camera.getFocusedOn() - 1][0] + (width / 2), (height / 2) - circleCenters[camera.getFocusedOn() - 1][1]);
        }
    
        if (displayScreen.circleShownToggle) {
            ctx.beginPath();
            ctx.arc(displayScreen.coordsToDrawX(0), displayScreen.coordsToDrawY(0), displayScreen.scale(displayScreen.vectors[0].radius), 0, 2*Math.PI, true);
            ctx.stroke();
    
            // draw each circle
            for (let i = 1; i < displayScreen.numVectInUse; i++) {
                if (i == camera.getFocusedOn()) {
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = "#ffabaa";
                }
                else if (i < camera.getFocusedOn() && camera.getFocusedOn() != 0) {
                    ctx.strokeStyle = "rgb(70 70 70 / 20%)";
                    ctx.lineWidth = 1;
                } else {
                    ctx.strokeStyle = "rgb(70 70 70)";
                    ctx.lineWidth = 1;
                }
                ctx.beginPath();
                ctx.arc(displayScreen.coordsToDrawX(circleCenters[i-1][0]), displayScreen.coordsToDrawY(circleCenters[i-1][1]), displayScreen.scale(displayScreen.vectors[i].radius), 0, 2*Math.PI, true);
                ctx.stroke();
            }
        }
    
        // draw radial lines for each circle
        ctx.strokeStyle = "#82b2ff";
        ctx.beginPath();
        ctx.moveTo(displayScreen.coordsToDrawX(0), displayScreen.coordsToDrawY(0));
    
        for (let i = 0; i < displayScreen.numVectInUse; i++) {
            ctx.lineTo(displayScreen.coordsToDrawX(circleCenters[i][0]), displayScreen.coordsToDrawY(circleCenters[i][1]));
        }
        ctx.stroke();
    
        // add final value of fourier transform at currT
        displayScreen.approximation.push([circleCenters[displayScreen.numVectInUse - 1][0], circleCenters[displayScreen.numVectInUse-1][1]]);
    
        if (displayScreen.currT > (Math.PI * 2) + .1) {
            displayScreen.approximation.shift();
        }
    
        // draw actual approximation
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#aaffd3";
        ctx.beginPath(displayScreen.coordsToDrawX(displayScreen.approximation[0][0]), displayScreen.coordsToDrawY(displayScreen.approximation[0][1]));
    
        for (let i = 1; i < displayScreen.approximation.length; i++) {
            ctx.lineTo(displayScreen.coordsToDrawX(displayScreen.approximation[i][0]), displayScreen.coordsToDrawY(displayScreen.approximation[i][1]));
        }
        ctx.stroke();
    
        // draw circle showing current x,y value of fourier transform at currT
        ctx.fillStyle = "#32fa92";
        ctx.beginPath();
        ctx.arc(displayScreen.coordsToDrawX(circleCenters[circleCenters.length - 1][0]), displayScreen.coordsToDrawY(circleCenters[circleCenters.length - 1][1]), 5, 0, 2*Math.PI, true);
        ctx.fill();
    
        displayScreen.drawNumVectors();
    
        displayScreen.currT += tInc;
    }
    
    drawNumVectors() {
        ctx.font = "48px serif";
        ctx.strokeText(this.numVectInUse, (width * .8), (height * .95));
    }
    
    drawGoal() {
        if (!this.goalShownToggle) {
            return;
        }
    
        ctx.fillStyle = "rgb(86 98 102 / 50%)";
    
        for (let i = 0; i < this.scaledInputs.length; i++) {
            ctx.beginPath();
    
            let x = this.coordsToDrawX(this.scaledInputs[i][0]);
            let y = this.coordsToDrawY(this.scaledInputs[i][1]);
            ctx.arc(x, y, 1, 0, 2*Math.PI, false);
            ctx.fill();
        }
    }
    
    getCoords(currT) {
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
    
    getVectorEndpoints(time) {
        let endpoints = [];
        let x, y;
        for (let i = 0; i < this.numVectInUse; i++) {
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

const canvas = document.getElementById("canvas_interactive");
const defaultNumOfVectors = 5;
const defaultTick = 30;
const ctx = canvas.getContext("2d");
const drawLineWidth = 2;
const tInc = .03;
const maxNumberOfVectors = 300;

function main() {
    // initialize global variables


    var positionInfo = canvas.getBoundingClientRect();
    height = positionInfo.height;
    width = positionInfo.width;

}


var height;
var width;



main();

var drawScreen = new DrawScreen();
var camera = new Camera(defaultTick);
var displayScreen = new DisplayScreen();


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


function loadListener() {
    drawScreen.initDrawMode();
    scaleCanvas();
}

function backButtonListener() {
    stopAnimationWrapper(displayScreen.timerId);
    drawScreen.initDrawMode();
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

        document.getElementById("range_focus_selector").disabled = true;
        drawApproximation();
    } else {
        stopAnimationWrapper(displayScreen.timerId);

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
        displayScreen.timerId = startAnimationWrapper(displayScreen.drawEpicycles, camera.getTickRate());
    }
}

function focusSliderListener() {
    // clearInterval(timerId);
    // camera.zoomTo(focusSlider.value);
    // timerId = setInterval(drawEpicycles, camera.tickRate);

    camera.zoomTo(focusSlider.value);
    console.log("focused on: " + camera.getFocusedOn() + " | focusSlider value: " + (focusSlider.value));

}

function startAnimationWrapper(fx, tRate) {
    
    if (!displayScreen.running) {
        displayScreen.running = true;
        t = setInterval(fx, tRate);
        return t;
    }
    return displayScreen.timerId;
}

function stopAnimationWrapper(t) {
    clearInterval(t);
    displayScreen.running = false;
}

function adjustNSliderListener() {
    if (approxOnlyToggle) {
        numVectInUse = adjustNSlider.value;
        vectors = transformation.getVectors(numVectInUse);
        drawApproximation();
    } else {

        stopAnimationWrapper(displayScreen.timerId);

        numVectInUse = adjustNSlider.value;
        vectors = transformation.getVectors(numVectInUse);

        focusSlider.max = numVectInUse - 1;

        if (focusSlider.value >= (numVectInUse - 1)) {
            console.log("HERE");
            focusSlider.value = (numVectInUse - 1);

            camera.zoomTo(numVectInUse - 1);

            focusSlider.max = (numVectInUse - 1);

        }
        console.log("# NSlider: " + adjustNSlider.value + " | numVectors: " + numVectInUse);
        console.log("focused on: " + camera.getFocusedOn() + " | focusSlider value: " + (focusSlider.value));
        displayScreen.timerId = startAnimationWrapper(displayScreen.drawEpicycles, camera.getTickRate());
    }


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
        let inputs = drawScreen.getInputs();

        if (inputs.length == 0) {
            drawScreen.drawDrawHere();
        } else {
            ctx.beginPath();
            ctx.moveTo(inputs[0][0], inputs[0][1]);
            for (let i = 1; i < inputs.length; i++) {
            ctx.lineTo(inputs[i][0], inputs[i][1]);
            }
            ctx.strokeStyle = "black";
            ctx.lineWidth = drawLineWidth;
            ctx.stroke();
            ctx.closePath();
        }
        if (drawScreen.sampleScreen) {
            drawScreen.initSampleScreen();
        }
    } else if (displayScreen.approxOnlyToggle) {
        drawApproximation();
    }
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