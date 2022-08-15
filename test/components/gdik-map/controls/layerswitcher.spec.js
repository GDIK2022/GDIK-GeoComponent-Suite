import Map from "ol/Map";

import * as wms from "masterportalAPI/src/layer/wms";

import LayerswitcherControl from "../../../../src/components/gdik-map/controls/layerswitcher";

import * as customConfig from "../assets/config.json";

describe("Layerswitcher", () => {
    const bgLayer1 = wms.createLayer(customConfig.services[0], {name: customConfig.services[0].name}),
        bgLayer2 = wms.createLayer(customConfig.services[1], {name: customConfig.services[1].name});

    it("should init layerswitcher", () => {
        expect(LayerswitcherControl).toBeDefined();

        const control = new LayerswitcherControl({backgroundLayers: ["1001", "1002"]});

        expect(control.element.className).toBe("ol-control gdik-layerswitcher");
        expect(control.element.firstChild.nodeName).toBe("UL");
    });

    it("should show correct names for background layer", () => {
        const backgroundLayers = ["1001", "1002"],
            map = new Map(),
            control = new LayerswitcherControl({backgroundLayers: backgroundLayers});

        map.addLayer(bgLayer1);
        map.addLayer(bgLayer2);

        control.setMap(map);

        expect(control.element.firstChild.childElementCount).toBe(2);

        for (let i = 0; i < 2; i++) {
            expect(control.element.firstChild.childNodes[i].nodeName).toBe("LI");
            expect(control.element.firstChild.childNodes[i].innerHTML).toBe(customConfig.services[i].name);
        }
    });
});