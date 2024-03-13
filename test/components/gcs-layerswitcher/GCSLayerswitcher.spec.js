import i18next from "i18next";

import mapsAPI from "masterportalAPI/src/maps/api.js";

import LayerManager from "../../../src/components/gcs-map/LayerManager";
import GCSLayerswitcher from "../../../src/components/gcs-layerswitcher/GCSLayerswitcher";

import * as defaultConfig from "../../../src/components/gcs-map/assets/config.json";
import * as customConfig from "../gcs-map/assets/config.json";

describe("Layerswitcher related", () => {

    it("should have added layerswitcher control", () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            layerManager = new LayerManager(map, defaultConfig.component.backgroundLayers),
            component = new GCSLayerswitcher();

        let layerswitcherElement = null,
            bgLayers = null;

        component.registerGCSMap(map, layerManager, i18next);

        layerswitcherElement = component.control.element;
        expect(layerswitcherElement).not.toBeNull();
        expect(layerswitcherElement.className).toBe("ol-control gcs-layerswitcher");

        bgLayers = layerswitcherElement.querySelectorAll("ul li");
        expect(bgLayers.length).toBe(2);

        expect(bgLayers[0].innerHTML).toBe("Basemap.de - Farbe");
    });

    it("should render all given background layers", async () => {
        const map = mapsAPI.map.createMap({...customConfig.portal, layerConf: customConfig.services}, "2D"),
            layerManager = new LayerManager(map, customConfig.component.backgroundLayers),
            component = new GCSLayerswitcher();

        component.registerGCSMap(map, layerManager, i18next);

        let bgLayers = null;

        bgLayers = component.control.element.querySelectorAll("ul li");
        expect(bgLayers.length).toBe(2);

        expect(bgLayers[0].innerHTML).toBe("basemap.de");
        expect(bgLayers[1].innerHTML).toBe("TopPlusOpen - Farbe");
    });
});
