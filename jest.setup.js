
require("jest-fetch-mock").enableMocks();

global.ResizeObserver = require("resize-observer-polyfill");

window.URL.createObjectURL = function () {
    // empty
};

window.parcelRequire = undefined;

class Worker {
    constructor (stringUrl) {
        this.url = stringUrl;
        this.onmessage = () => {
            // empty
        };
    }

    postMessage (msg) {
        this.onmessage(msg);
    }
}
// a mock for web worker
window.Worker = Worker;

import i18next from "i18next";
beforeAll(() => {
    i18next.init({debug: false, lng: "dev"});
});