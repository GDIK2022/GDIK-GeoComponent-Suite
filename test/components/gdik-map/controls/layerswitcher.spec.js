import Map from "ol/Map";

import * as wms from "masterportalAPI/src/layer/wms";

import LayerswitcherControl from "../../../../src/components/gdik-map/controls/layerswitcher";

import * as customConfig from "../assets/config.json";

describe("Layerswitcher", () => {
    const bgLayer1 = wms.createLayer(customConfig.services[0], {name: customConfig.services[0].name}),
        bgLayer2 = wms.createLayer(customConfig.services[1], {name: customConfig.services[1].name});

    it("should init layerswitcher", () => {
        expect(LayerswitcherControl).toBeDefined();

        const control = new LayerswitcherControl([bgLayer1, bgLayer2]);

        expect(control.element.className).toBe("ol-control gdik-layerswitcher");
        expect(control.element.firstChild.nodeName).toBe("UL");
    });

    it("should render layer entry as expected", () => {
        const map = new Map(),
            control = new LayerswitcherControl([bgLayer1]);

        let layerEntry = null;

        map.addLayer(bgLayer1);

        control.setMap(map);

        expect(control.element.firstChild.childElementCount).toBe(1);

        layerEntry = control.element.firstChild.childNodes[0];

        expect(layerEntry.nodeName).toBe("LI");
        expect(layerEntry.firstChild.nodeName).toBe("INPUT");
        expect(layerEntry.firstChild.type).toBe("radio");
        expect(layerEntry.firstChild.name).toBe("bg-layer");
        expect(layerEntry.firstChild.id).toBe("bg-layer-1001");

        expect(layerEntry.lastChild.nodeName).toBe("LABEL");
        expect(layerEntry.lastChild.for).toBe("bg-layer-1001");
        expect(layerEntry.lastChild.innerHTML).toBe(customConfig.services[0].name);
    });

    it("should show correct names for background layer", () => {
        const map = new Map(),
            control = new LayerswitcherControl([bgLayer1, bgLayer2]);

        map.addLayer(bgLayer1);
        map.addLayer(bgLayer2);

        control.setMap(map);

        expect(control.element.firstChild.childElementCount).toBe(2);

        for (let i = 0; i < 2; i++) {
            expect(control.element.firstChild.childNodes[i].nodeName).toBe("LI");
            expect(control.element.firstChild.childNodes[i].lastChild.innerHTML).toBe(customConfig.services[i].name);
        }
    });
});