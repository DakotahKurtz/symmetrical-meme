import {epiLoadListener, scaleEpiCanvas} from './epicycledisplay.js'


window.addEventListener('resize', scaleCanvas);
window.addEventListener("load", loadListener);

function loadListener() {
    epiLoadListener();
}

function scaleCanvas() {
    scaleEpiCanvas();
}