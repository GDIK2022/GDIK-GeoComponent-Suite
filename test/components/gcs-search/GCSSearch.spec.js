import mapsAPI from "masterportalAPI/src/maps/api.js";

import GCSSearch from "../../../src/components/gcs-search/GCSSearch";

import * as defaultConfig from "../../../src/components/gcs-map/assets/config.json";

describe("Search related", () => {

    it("should have added search control", () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            component = new GCSSearch();

        let searchElement = null;

        component.registerGCSMap(map);

        searchElement = component.control.element;
        expect(searchElement).not.toBeNull();
        expect(searchElement.className).toBe("ol-control gcs-search");
    });

    it("should use urls given by attributes", async () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            component = new GCSSearch(),
            searchUrl = "https://search";

        component.setAttribute("search-url", searchUrl);

        await component.connectedCallback();

        component.registerGCSMap(map);

        expect(component.control.search.searchUrl).toBe(searchUrl);
    });
    describe("attributeChangedCallback tests", () => {
        const component = new GCSSearch();

        it("should return if oldvalue === null", async () => {
            expect(component.attributeChangedCallback("", null, null)).toBe(undefined);
        });
        it("should return if oldvalue === newvalue", async () => {
            expect(component.attributeChangedCallback("", "test", "test")).toBe(undefined);
        });
        it("should return if control is undefined", async () => {
            expect(component.attributeChangedCallback("", "oldvalue", "newvalue")).toBe(undefined);
        });
        it("should use search String given by attributes", async () => {

            const map = {addControl: (control) => {
                    return control;
                }},
                searchUrl = "https://search",
                searchString = "Stadt";

            component.setAttribute("search-url", searchUrl);
            component.setAttribute("search-string", searchString);

            await component.connectedCallback();

            component.registerGCSMap(map);

            expect(component.searchString).toBe(searchString);
            component.setAttribute("search-string", "Stade");
            expect(component.searchString).toBe("Stade");
        });
        it("should use ignore undefined properties", async () => {
            const map = {addControl: (control) => {
                return control;
            }};

            component.registerGCSMap(map);
            expect(component.attributeChangedCallback("undefined", "oldvalue", "newvalue")).toBe(undefined);
        });
    });
});
