import mapsAPI from "masterportalAPI/src/maps/api.js";

import GDIKGeolocation from "../../../src/components/gdik-geolocation/GDIKGeolocation";

import * as defaultConfig from "../../../src/components/gdik-map/assets/config.json";

describe("Geolocation related", () => {

    it("should have added geolocation control", () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            component = new GDIKGeolocation();

        let geolocationElement = null;

        component.registerGDIKMap(map);

        geolocationElement = component.control.element;
        expect(geolocationElement).not.toBeNull();
        expect(geolocationElement.className).toBe("ol-control gdik-geolocation");
    });
});
