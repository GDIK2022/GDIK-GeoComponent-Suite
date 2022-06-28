/* eslint-env node */
module.exports = {
    /** ol prints errors without HTMLCanvasElement being available in test environment */
    setupFiles: ["jest-canvas-mock"],
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["./jest.setup.js"],
    verbose: true,
    /** mapping svg to string representation since jest can't handle svg */
    moduleNameMapper: {
        "marker.svg": "<rootDir>node_modules/masterportalAPI/public/stringMarker.js"
    },
    transformIgnorePatterns: ["/node_modules/(?!(masterportalAPI|ol|olcs|ol-mapbox-style|geotiff)/).*/"],
    testMatch: ["<rootDir>/test/**/?(*.)(spec|test).js"],
    testPathIgnorePatterns: ["<rootDir>/(node_modules|bin|build)"],
    transform: {
        "^.+\\.jsx?$": "babel-jest"
    },
};
