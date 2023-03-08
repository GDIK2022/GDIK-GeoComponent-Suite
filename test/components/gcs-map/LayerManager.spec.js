import VectorLayer from "ol/layer/Vector";

import {initializeLayerList} from "masterportalAPI/src/rawLayerList";
import mapsAPI from "masterportalAPI/src/maps/api.js";

import LayerManager from "../../../src/components/gcs-map/LayerManager";

describe("LayerManager", () => {

    beforeEach(() => {
        initializeLayerList([
            {
                "id": "1001",
                "typ": "WMS",
                "name": "WebAtlasDe",
                "url": "https://sg.geodatenzentrum.de/wms_webatlasde__54a30b0f-b92f-34ba-39c0-3af32cfa13d6",
                "version": "1.1.1",
                "layers": "webatlasde",
                "transparent": true,
                "singleTile": false,
                "tilesize": 256,
                "gutter": 0
            },
            {
                "id": "1002",
                "typ": "WMS",
                "name": "TopPlusOpen - Farbe",
                "url": "https://sgx.geodatenzentrum.de/wms_topplus_open",
                "version": "1.1.1",
                "layers": "web",
                "transparent": true,
                "singleTile": false,
                "tilesize": 256,
                "gutter": 20
            }
        ]);
    });

    it("should create layers from given ids", () => {
        const map = mapsAPI.map.createMap(),
            backgroundLayers = ["1001"],
            layerManager = new LayerManager(map, backgroundLayers);

        expect(layerManager.olBackgroundLayer.length).toBe(1);

        expect(layerManager.activeBackgroundLayer.get("name")).toBe("WebAtlasDe");

    });

    it("should have first given background layer visible", () => {
        const map = mapsAPI.map.createMap();

        let backgroundLayers = ["1001", "1002"],
            layerManager = new LayerManager(map, backgroundLayers);

        expect(layerManager.olBackgroundLayer.length).toBe(2);

        expect(layerManager.activeBackgroundLayer.get("name")).toBe("WebAtlasDe");

        expect(layerManager.olBackgroundLayer[0].get("name")).toBe("WebAtlasDe");
        expect(layerManager.olBackgroundLayer[0].getVisible()).toBe(true);
        expect(layerManager.olBackgroundLayer[1].get("name")).toBe("TopPlusOpen - Farbe");
        expect(layerManager.olBackgroundLayer[1].getVisible()).toBe(false);

        backgroundLayers = ["1002", "1001"];
        layerManager = new LayerManager(map, backgroundLayers);

        expect(layerManager.olBackgroundLayer.length).toBe(2);

        expect(layerManager.activeBackgroundLayer.get("name")).toBe("TopPlusOpen - Farbe");

        expect(layerManager.olBackgroundLayer[0].get("name")).toBe("TopPlusOpen - Farbe");
        expect(layerManager.olBackgroundLayer[0].getVisible()).toBe(true);
        expect(layerManager.olBackgroundLayer[1].get("name")).toBe("WebAtlasDe");
        expect(layerManager.olBackgroundLayer[1].getVisible()).toBe(false);
    });

    it("should change the active and visible background layer", () => {
        const map = mapsAPI.map.createMap(),
            backgroundLayers = ["1001", "1002"],
            layerManager = new LayerManager(map, backgroundLayers);

        expect(layerManager.activeBackgroundLayer.get("name")).toBe("WebAtlasDe");
        expect(layerManager.olBackgroundLayer[0].getVisible()).toBe(true);
        expect(layerManager.olBackgroundLayer[1].getVisible()).toBe(false);

        layerManager.changeBackgroundLayer("1002");

        expect(layerManager.activeBackgroundLayer.get("name")).toBe("TopPlusOpen - Farbe");
        expect(layerManager.olBackgroundLayer[0].getVisible()).toBe(false);
        expect(layerManager.olBackgroundLayer[1].getVisible()).toBe(true);
    });

    it("should log an error when given background layer id not present", () => {
        const map = mapsAPI.map.createMap(),
            backgroundLayers = ["1003"];

        console.error = jest.fn();

        new LayerManager(map, backgroundLayers);

        expect(console.error.mock.calls[0][0]).toBe("Background layer with id '1003' not found. Skipped.");
    });

    it("should log an error when changing background layer to a not present id", async () => {
        const map = mapsAPI.map.createMap(),
            backgroundLayers = ["1002"],
            layerManager = new LayerManager(map, backgroundLayers);

        console.error = jest.fn();

        await layerManager.changeBackgroundLayer("1003").catch((err) => {
            expect(err).toEqual("Background layer with id 1003 not found");
        });

        expect(console.error.mock.calls[0][0]).toBe("Background layer with id 1003 not found");
    });

    it("should add layer on top", () => {
        const map = mapsAPI.map.createMap(),
            backgroundLayers = ["1001", "1002"],
            layerManager = new LayerManager(map, backgroundLayers),
            layerOne = new VectorLayer(),
            layerTwo = new VectorLayer();

        layerOne.set("name", "layerOne");
        layerTwo.set("name", "layerTwo");

        layerManager.addLayerOnTop(layerOne);

        expect(map.getLayers().item(map.getLayers().getLength() - 1).get("name")).toBe("layerOne");

        layerManager.addLayerOnTop(layerTwo);
        expect(map.getLayers().item(map.getLayers().getLength() - 1).get("name")).toBe("layerTwo");
    });
});