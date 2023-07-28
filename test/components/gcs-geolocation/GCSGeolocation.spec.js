
import i18next from "i18next";

import mapsAPI from "masterportalAPI/src/maps/api.js";

import GCSGeolocation from "../../../src/components/gcs-geolocation/GCSGeolocation";

import * as defaultConfig from "../../../src/components/gcs-map/assets/config.json";

describe("Geolocation related", () => {

    it("should have added geolocation control", () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            component = new GCSGeolocation();

        let geolocationElement = null;

        component.registerGCSMap(map, undefined, i18next);

        geolocationElement = component.control.element;
        expect(geolocationElement).not.toBeNull();
        expect(geolocationElement.className).toBe("ol-control gcs-geolocation");
    });
});
