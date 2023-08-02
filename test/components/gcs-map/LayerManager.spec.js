import VectorLayer from "ol/layer/Vector";

import rawLayerList from "masterportalAPI/src/rawLayerList";
import mapsAPI from "masterportalAPI/src/maps/api.js";

import LayerManager from "../../../src/components/gcs-map/LayerManager";

describe("LayerManager", () => {

    beforeEach(() => {
        rawLayerList.initializeLayerList([
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
            },
            {
                "id": "2003",
                "typ": "WMS",
                "name": "My WMS",
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
            backgroundLayerIds = ["1001"],
            layerManager = new LayerManager(map, backgroundLayerIds);

        expect(layerManager.backgroundLayers.length).toBe(1);

        expect(layerManager.activeBackgroundLayer.get("name")).toBe("WebAtlasDe");

    });

    it("should create foreground layer from given id", () => {
        const map = mapsAPI.map.createMap(),
            backgroundLayerIds = [],
            foregroundLayerId = "2003",
            layerManager = new LayerManager(map, backgroundLayerIds, foregroundLayerId);

        expect(layerManager.foregroundLayer).not.toBeNull();

        expect(layerManager.foregroundLayer.get("name")).toBe("My WMS");

    });

    it("should create only background layers from given ids", () => {
        const map = mapsAPI.map.createMap(),
            backgroundLayerIds = ["1001"],
            layerManager = new LayerManager(map, backgroundLayerIds);

        expect(layerManager.backgroundLayers.length).toBe(1);
        expect(layerManager.foregroundLayer).toBeNull();

        expect(layerManager.activeBackgroundLayer.get("name")).toBe("WebAtlasDe");

    });

    it("should have first given background layer visible", () => {
        const map = mapsAPI.map.createMap();

        let backgroundLayerIds = ["1001", "1002"],
            layerManager = new LayerManager(map, backgroundLayerIds);

        expect(layerManager.backgroundLayers.length).toBe(2);

        expect(layerManager.activeBackgroundLayer.get("name")).toBe("WebAtlasDe");

        expect(layerManager.backgroundLayers[0].get("name")).toBe("WebAtlasDe");
        expect(layerManager.backgroundLayers[0].getVisible()).toBe(true);
        expect(layerManager.backgroundLayers[1].get("name")).toBe("TopPlusOpen - Farbe");
        expect(layerManager.backgroundLayers[1].getVisible()).toBe(false);

        backgroundLayerIds = ["1002", "1001"];
        layerManager = new LayerManager(map, backgroundLayerIds);

        expect(layerManager.backgroundLayers.length).toBe(2);

        expect(layerManager.activeBackgroundLayer.get("name")).toBe("TopPlusOpen - Farbe");

        expect(layerManager.backgroundLayers[0].get("name")).toBe("TopPlusOpen - Farbe");
        expect(layerManager.backgroundLayers[0].getVisible()).toBe(true);
        expect(layerManager.backgroundLayers[1].get("name")).toBe("WebAtlasDe");
        expect(layerManager.backgroundLayers[1].getVisible()).toBe(false);
    });

    it("should change the active and visible background layer", () => {
        const map = mapsAPI.map.createMap(),
            backgroundLayersIds = ["1001", "1002"],
            layerManager = new LayerManager(map, backgroundLayersIds);

        expect(layerManager.activeBackgroundLayer.get("name")).toBe("WebAtlasDe");
        expect(layerManager.backgroundLayers[0].getVisible()).toBe(true);
        expect(layerManager.backgroundLayers[1].getVisible()).toBe(false);

        layerManager.changeBackgroundLayer("1002");

        expect(layerManager.activeBackgroundLayer.get("name")).toBe("TopPlusOpen - Farbe");
        expect(layerManager.backgroundLayers[0].getVisible()).toBe(false);
        expect(layerManager.backgroundLayers[1].getVisible()).toBe(true);
    });

    it("should keep the foreground layer on top when changing the active background layer", () => {
        const map = mapsAPI.map.createMap(),
            backgroundLayersIds = ["1001", "1002"],
            foregroundLayerId = "2003",
            layerManager = new LayerManager(map, backgroundLayersIds, foregroundLayerId);

        expect(map.getLayers().item(map.getLayers().getLength() - 1).get("name")).toBe("My WMS");

        layerManager.changeBackgroundLayer("1002");

        expect(map.getLayers().item(map.getLayers().getLength() - 1).get("name")).toBe("My WMS");
    });

    it("should log an error when given background layer id not present", () => {
        const map = mapsAPI.map.createMap(),
            backgroundLayerIds = ["1003"];

        console.error = jest.fn();

        new LayerManager(map, backgroundLayerIds);

        expect(console.error.mock.calls[0][0]).toBe("Background layer with id '1003' not found. Skipped.");
    });

    it("should log an error when given foreground layer id not present", () => {
        const map = mapsAPI.map.createMap(),
            backgroundLayerIds = [],
            foregroundLayerId = "1337";

        console.error = jest.fn();

        new LayerManager(map, backgroundLayerIds, foregroundLayerId);

        expect(console.error.mock.calls[0][0]).toBe("Foreground layer with id '1337' not found.");
    });

    it("should log an error when changing background layer to a not present id", async () => {
        const map = mapsAPI.map.createMap(),
            backgroundLayerIds = ["1002"],
            layerManager = new LayerManager(map, backgroundLayerIds);

        console.error = jest.fn();

        await layerManager.changeBackgroundLayer("1003").catch((err) => {
            expect(err).toEqual("Background layer with id 1003 not found");
        });

        expect(console.error.mock.calls[0][0]).toBe("Background layer with id 1003 not found");
    });

    it("should set the interaction layer on top", () => {
        const map = mapsAPI.map.createMap(),
            backgroundLayerIds = ["1001", "1002"],
            layerManager = new LayerManager(map, backgroundLayerIds),
            layerOne = new VectorLayer(),
            layerTwo = new VectorLayer();

        layerOne.set("name", "layerOne");
        layerTwo.set("name", "layerTwo");

        layerManager.setInteractionLayer(layerOne);

        expect(map.getLayers().item(map.getLayers().getLength() - 1).get("name")).toBe("layerOne");

        layerManager.setInteractionLayer(layerTwo);
        expect(map.getLayers().item(map.getLayers().getLength() - 1).get("name")).toBe("layerTwo");
    });

    it("should replace the existing interactionLayer with a new one", () => {
        const map = mapsAPI.map.createMap(),
            backgroundLayerIds = ["1001", "1002"],
            layerManager = new LayerManager(map, backgroundLayerIds),
            layerOne = new VectorLayer(),
            layerTwo = new VectorLayer();

        layerOne.set("name", "layerOne");
        layerTwo.set("name", "layerTwo");

        layerManager.setInteractionLayer(layerOne);

        expect(map.getLayers().getLength()).toBe(3);

        layerManager.setInteractionLayer(layerTwo);
        expect(map.getLayers().getLength()).toBe(3);
    });

    it("should keep the foregroundLayer 1 below the interactionLayer", () => {
        const map = mapsAPI.map.createMap(),
            backgroundLayerIds = ["1001", "1002"],
            foregroundLayerId = "2003",
            layerManager = new LayerManager(map, backgroundLayerIds, foregroundLayerId),
            layerOne = new VectorLayer(),
            layerTwo = new VectorLayer();

        layerOne.set("name", "layerOne");
        layerTwo.set("name", "layerTwo");

        layerManager.setInteractionLayer(layerOne);

        expect(map.getLayers().item(map.getLayers().getLength() - 1).get("name")).toBe("layerOne");
        expect(map.getLayers().item(map.getLayers().getLength() - 2).get("name")).toBe("My WMS");

        layerManager.setInteractionLayer(layerTwo);
        expect(map.getLayers().item(map.getLayers().getLength() - 1).get("name")).toBe("layerTwo");
        expect(map.getLayers().item(map.getLayers().getLength() - 2).get("name")).toBe("My WMS");
    });

    it("should have foreground layer on top", () => {
        const map = mapsAPI.map.createMap(),
            backgroundLayerIds = ["1001", "1002"],
            foregroundLayerId = "2003",
            layerManager = new LayerManager(map, backgroundLayerIds, foregroundLayerId);

        expect(layerManager.foregroundLayer).not.toBeNull();

        expect(layerManager.foregroundLayer.get("name")).toBe("My WMS");
        expect(map.getLayers().item(map.getLayers().getLength() - 1).get("name")).toBe("My WMS");

    });
});
