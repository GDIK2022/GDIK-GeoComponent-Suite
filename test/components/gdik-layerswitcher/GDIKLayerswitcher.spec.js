import mapsAPI from "masterportalAPI/src/maps/api.js";

import LayerManager from "../../../src/components/gdik-map/LayerManager";
import GDIKLayerswitcher from "../../../src/components/gdik-layerswitcher/GDIKLayerswitcher";

import * as defaultConfig from "../../../src/components/gdik-map/assets/config.json";
import * as customConfig from "../gdik-map/assets/config.json";

describe("Layerswitcher related", () => {

    it("should have added layerswitcher control", () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            layerManager = new LayerManager(map, defaultConfig.component.backgroundLayers),
            component = new GDIKLayerswitcher();

        let layerswitcherElement = null,
            bgLayers = null;

        component.registerGDIKMap(map, layerManager);

        layerswitcherElement = component.control.element;
        expect(layerswitcherElement).not.toBeNull();
        expect(layerswitcherElement.className).toBe("ol-control gdik-layerswitcher");

        bgLayers = layerswitcherElement.querySelectorAll("ul li");
        expect(bgLayers.length).toBe(2);

        expect(bgLayers[0].innerHTML).toBe("WebAtlasDe");
    });

    it("should render all given background layers", async () => {
        const map = mapsAPI.map.createMap({...customConfig.portal, layerConf: customConfig.services}, "2D"),
            layerManager = new LayerManager(map, customConfig.component.backgroundLayers),
            component = new GDIKLayerswitcher();

        component.registerGDIKMap(map, layerManager);

        let bgLayers = null;

        bgLayers = component.control.element.querySelectorAll("ul li");
        expect(bgLayers.length).toBe(2);

        expect(bgLayers[0].innerHTML).toBe("WebAtlasDe");
        expect(bgLayers[1].innerHTML).toBe("TopPlusOpen - Farbe");
    });
});
