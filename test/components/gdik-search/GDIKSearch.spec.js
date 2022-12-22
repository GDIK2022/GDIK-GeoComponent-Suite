import mapsAPI from "masterportalAPI/src/maps/api.js";

import GDIKSearch from "../../../src/components/gdik-search/GDIKSearch";

import * as defaultConfig from "../../../src/components/gdik-map/assets/config.json";

describe("Search related", () => {

    it("should have added search control", () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            component = new GDIKSearch();

        let searchElement = null;

        component.registerGDIKMap(map);

        searchElement = component.control.element;
        expect(searchElement).not.toBeNull();
        expect(searchElement.className).toBe("ol-control gdik-search");
    });

    it("shoud use urls given by attributes", async () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            component = new GDIKSearch(),
            searchUrl = "https://search";

        component.setAttribute("search-url", searchUrl);

        await component.connectedCallback();

        component.registerGDIKMap(map);

        expect(component.control.search.searchUrl).toBe(searchUrl);
    });
});
