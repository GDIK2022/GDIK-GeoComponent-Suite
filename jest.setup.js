require("jest-fetch-mock").enableMocks();

window.URL.createObjectURL = function () {
    // empty
};

window.parcelRequire = undefined;