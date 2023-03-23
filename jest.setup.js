require("jest-fetch-mock").enableMocks();

global.ResizeObserver = require("resize-observer-polyfill");

window.URL.createObjectURL = function () {
    // empty
};

window.parcelRequire = undefined;