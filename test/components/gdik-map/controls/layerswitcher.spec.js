import mapsAPI from "masterportalAPI/src/maps/api.js";
import {initializeLayerList} from "masterportalAPI/src/rawLayerList";

import LayerswitcherControl from "../../../../src/components/gdik-map/controls/layerswitcher";

import LayerManager from "../../../../src/components/gdik-map/LayerManager";

describe("Layerswitcher", () => {

    let layerManager, map, rawLayers;

    beforeEach(() => {
        rawLayers = [
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
        ];


        initializeLayerList(rawLayers);

        map = mapsAPI.map.createMap();
        layerManager = new LayerManager(map, ["1001", "1002"]);
    });

    it("should init layerswitcher", () => {
        expect(LayerswitcherControl).toBeDefined();

        const control = new LayerswitcherControl(layerManager);

        expect(control.element.className).toBe("ol-control gdik-layerswitcher");
        expect(control.element.firstChild.nodeName).toBe("UL");
        expect(control.element.firstChild.className).toBe("list-group");
        expect(control.element.firstChild.childElementCount).toBe(0);
    });

    it("should render layer entry as expected", () => {
        const control = new LayerswitcherControl(layerManager);

        control.setMap(map);

        // TODO review lint settings
        let layerEntry = null;

        layerEntry = control.element.firstChild.childNodes[0];

        expect(layerEntry.nodeName).toBe("LI");
        expect(layerEntry.className).toContain("list-group-item");
        expect(layerEntry.innerHTML).toBe(rawLayers[0].name);
    });

    it("should show correct names for background layer", () => {
        const control = new LayerswitcherControl(layerManager);

        control.setMap(map);

        expect(control.element.firstChild.childElementCount).toBe(2);

        for (let i = 0; i < 2; i++) {
            expect(control.element.firstChild.childNodes[i].nodeName).toBe("LI");
            expect(control.element.firstChild.childNodes[i].innerHTML).toBe(rawLayers[i].name);
        }

        expect(control.element.firstChild.childNodes[0].className).toBe("list-group-item active");
        expect(control.element.firstChild.childNodes[1].className).toBe("list-group-item");
    });

    it("should change visible background layer", (done) => {
        const control = new LayerswitcherControl(layerManager);

        control.setMap(map);

        expect(control.element.firstChild.childNodes[0].className).toBe("list-group-item active");
        expect(map.getLayers().item(0).getVisible()).toBe(true);
        expect(control.element.firstChild.childNodes[1].className).toBe("list-group-item");
        expect(map.getLayers().item(1).getVisible()).toBe(false);

        control.handleBackgroundLayerChange("1002").then(() => {

            expect(control.element.firstChild.childNodes[0].className).toBe("list-group-item");
            expect(map.getLayers().item(0).getVisible()).toBe(false);
            expect(control.element.firstChild.childNodes[1].className).toBe("list-group-item active");
            expect(map.getLayers().item(1).getVisible()).toBe(true);
            done();
        });

    });
});