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

    it("shoud use urls given by attributes", async () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            component = new GCSSearch(),
            searchUrl = "https://search";

        component.setAttribute("search-url", searchUrl);

        await component.connectedCallback();

        component.registerGCSMap(map);

        expect(component.control.search.searchUrl).toBe(searchUrl);
    });
});
