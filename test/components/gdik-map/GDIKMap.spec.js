import {enableFetchMocks} from "jest-fetch-mock";
enableFetchMocks();

import GDIKMap from "../../../src/components/gdik-map/GDIKMap";
import * as defaultConfig from "../../../src/components/gdik-map/assets/config.json";
import * as customConfig from "./assets/config.json";

describe("Init gdik-map", () => {

    beforeEach(() => {
        fetch.resetMocks();
    });

    it("can create gdik-map component", () => {
        expect(GDIKMap).toBeDefined();

        const component = new GDIKMap();

        expect(component).toBeDefined();
    });

    it("should render gdik-map component", async () => {
        const component = new GDIKMap();

        await component.connectedCallback();

        expect(component.shadowRoot.firstChild.nodeName).toBe("DIV");
        expect(component.shadowRoot.firstChild.getAttribute("id")).toBe("map-div-id");

        expect(component.shadowRoot.firstChild.style.height).toBe("100%");
        expect(component.shadowRoot.firstChild.style.width).toBe("100%");
        expect(component.shadowRoot.firstChild.style.margin).toBe("auto");

        expect(component.shadowRoot.firstChild.firstChild.className).toBe("ol-viewport");
    });

    it("should use values from default config", async () => {
        const component = new GDIKMap();

        await component.connectedCallback();

        expect(Number(component.getAttribute("lon"))).toBe(defaultConfig.portal.startCenter[0]);
        expect(Number(component.getAttribute("lat"))).toBe(defaultConfig.portal.startCenter[1]);

        expect(component.map.getView().getCenter()).toEqual(defaultConfig.portal.startCenter);

        expect(component.getAttribute("layer")).toBe("1001");
    });

    it("should extent default config with values from given config", async () => {
        fetch.mockResponseOnce(JSON.stringify(customConfig));
        const component = new GDIKMap(),
            loadedConfig = await component.fetchConfig("http://config.service/config.json");

        expect(loadedConfig).not.toBe(false);
        expect(loadedConfig.portal).not.toBe(undefined);
        expect(loadedConfig).toEqual(customConfig);
    });

    it("should apply loaded config values to element attributes", async () => {
        fetch.mockResponseOnce(JSON.stringify(customConfig));
        const component = new GDIKMap();

        component.setAttribute("config-url", "http://config.service/config.json");

        await component.connectedCallback();

        expect(Number(component.getAttribute("lon"))).toBe(customConfig.portal.startCenter[0]);
        expect(Number(component.getAttribute("lat"))).toBe(customConfig.portal.startCenter[1]);

        expect(component.map.getView().getCenter()).toEqual(customConfig.portal.startCenter);

        expect(component.getAttribute("layer")).toBe(customConfig.portal.layers[0].id);
    });

    it("should apply values given by element attributes", async () => {
        const component = new GDIKMap(),
            lon = 450000.0,
            lat = 5500000.0,
            layer = "1002";

        component.setAttribute("lon", lon);
        component.setAttribute("lat", lat);
        component.setAttribute("layer", layer);

        await component.connectedCallback();

        expect(Number(component.getAttribute("lon"))).toBe(lon);
        expect(Number(component.getAttribute("lat"))).toBe(lat);

        expect(component.map.getView().getCenter()).toEqual([lon, lat]);

        expect(component.getAttribute("layer")).toBe(layer);
    });
});