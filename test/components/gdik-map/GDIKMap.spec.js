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

        expect(component.shadowRoot.childNodes.length).toBe(3);
        expect(component.shadowRoot.childNodes[0].nodeName).toBe("STYLE");
        expect(component.shadowRoot.childNodes[1].nodeName).toBe("DIV");
        expect(component.shadowRoot.childNodes[2].nodeName).toBe("SLOT");

        expect(component.shadowRoot.childNodes[1].firstChild.className).toBe("ol-viewport");
    });

    it("should use values from default config", async () => {
        const component = new GDIKMap();

        await component.connectedCallback();

        expect(Number(component.getAttribute("lon"))).toBe(defaultConfig.portal.startCenter[0]);
        expect(Number(component.getAttribute("lat"))).toBe(defaultConfig.portal.startCenter[1]);

        expect(Number(component.getAttribute("zoom"))).toBe(defaultConfig.portal.startZoomLevel);

        expect(component.map.getView().getCenter()).toEqual(defaultConfig.portal.startCenter);

        expect(component.getAttribute("active-bg")).toBe("1001");
    });

    it("should use values from given config", async () => {
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

        expect(fetch).toBeCalledWith("http://config.service/config.json");

        expect(Number(component.getAttribute("lon"))).toBe(customConfig.portal.startCenter[0]);
        expect(Number(component.getAttribute("lat"))).toBe(customConfig.portal.startCenter[1]);
        expect(Number(component.getAttribute("zoom"))).toBe(customConfig.portal.startZoomLevel);

        expect(component.map.getView().getCenter()).toEqual(customConfig.portal.startCenter);

        expect(component.getAttribute("active-bg")).toBe(customConfig.portal.backgroundLayers[0]);
    });

    it("should apply values given by element attributes", async () => {
        const component = new GDIKMap(),
            lon = 450000.0,
            lat = 5500000.0,
            zoom = 8;

        component.setAttribute("lon", lon);
        component.setAttribute("lat", lat);
        component.setAttribute("zoom", zoom);

        await component.connectedCallback();

        expect(Number(component.getAttribute("lon"))).toBe(lon);
        expect(Number(component.getAttribute("lat"))).toBe(lat);

        expect(component.map.getView().getCenter()).toEqual([lon, lat]);
        expect(Number(component.map.getView().getZoom())).toBe(zoom);
    });
});

describe("Attribute active-bg", () => {
    beforeAll(() => {
        jest.spyOn(console, "error").mockImplementation(() => {
            // noop
        });
    });

    afterAll(() => {
        console.error.mockRestore();
    });

    afterEach(() => {
        console.error.mockClear();
    });

    it("should use background layer given by attribute for init", async () => {
        fetch.mockResponseOnce(JSON.stringify(customConfig));
        const component = new GDIKMap(),
            backgroundLayer = "1002";

        component.setAttribute("config-url", "http://config.service/config.json");

        component.setAttribute("active-bg", backgroundLayer);
        await component.connectedCallback();

        expect(component.layerManager.activeBackgroundLayer.get("id")).toBe(backgroundLayer);
    });

    it("should change background layer when attribute changes", async () => {
        fetch.mockResponseOnce(JSON.stringify(customConfig));
        const component = new GDIKMap(),
            backgroundLayer = "1002";

        component.setAttribute("config-url", "http://config.service/config.json");

        await component.connectedCallback();
        expect(component.layerManager.activeBackgroundLayer.get("id")).toBe("1001");

        component.setAttribute("active-bg", backgroundLayer);

        expect(component.layerManager.activeBackgroundLayer.get("id")).toBe(backgroundLayer);
    });

    it("should log an error when background layer cannot be found on init", async () => {
        const component = new GDIKMap(),
            backgroundLayer = "1003";

        console.error = jest.fn();

        component.setAttribute("active-bg", backgroundLayer);
        await component.connectedCallback();
        expect(console.error.mock.calls[0][0]).toBe("Background layer with id 1003 not found");

        expect(component.getAttribute("active-bg", "1001"));
        expect(component.layerManager.activeBackgroundLayer.get("id")).toBe("1001");
    });

    it("should log an error when background layer cannot be found on attribute change", async () => {
        const component = new GDIKMap(),
            backgroundLayer = "1003";

        console.error = jest.fn();

        await component.connectedCallback();

        component.setAttribute("active-bg", backgroundLayer);
        expect(console.error.mock.calls[0][0]).toBe("Background layer with id 1003 not found");

        expect(component.getAttribute("active-bg", "1001"));
        expect(component.layerManager.activeBackgroundLayer.get("id")).toBe("1001");
    });
});

describe("Attribute change related", () => {
    it("should change map content on component attribute change", async () => {
        const component = new GDIKMap(),
            lon = 450000.0,
            lat = 5500000.0,
            zoom = 8,
            backgroundLayer = "1002";

        await component.connectedCallback();

        expect(Number(component.getAttribute("lon"))).toBe(defaultConfig.portal.startCenter[0]);
        expect(Number(component.getAttribute("lat"))).toBe(defaultConfig.portal.startCenter[1]);
        expect(Number(component.getAttribute("zoom"))).toBe(defaultConfig.portal.startZoomLevel);

        expect(component.getAttribute("active-bg")).toBe(defaultConfig.portal.backgroundLayers[0]);

        component.setAttribute("lon", lon);
        component.setAttribute("lat", lat);
        component.setAttribute("zoom", zoom);
        component.setAttribute("active-bg", backgroundLayer);

        expect(component.map.getView().getCenter()).toEqual([lon, lat]);
        expect(component.map.getView().getZoom()).toBe(zoom);

        expect(component.layerManager.activeBackgroundLayer.get("id")).toBe(backgroundLayer);
    });

    it("should change lon lat attributes when map center changed", async () => {
        const component = new GDIKMap(),
            center = [450000.0, 5500000.0];

        await component.connectedCallback();

        expect(Number(component.getAttribute("lon"))).toBe(defaultConfig.portal.startCenter[0]);
        expect(Number(component.getAttribute("lat"))).toBe(defaultConfig.portal.startCenter[1]);

        component.map.getView().setCenter(center);
        component.map.dispatchEvent("moveend");

        expect(Number(component.getAttribute("lon"))).toBe(center[0]);
        expect(Number(component.getAttribute("lat"))).toBe(center[1]);
    });

    it("should change zoom attribte when map zoom changes", async () => {
        const component = new GDIKMap(),
            zoom = 8;

        await component.connectedCallback();

        expect(Number(component.getAttribute("zoom"))).toBe(defaultConfig.portal.startZoomLevel);

        component.map.getView().setZoom(zoom);
        component.map.dispatchEvent("moveend");

        expect(Number(component.getAttribute("zoom"))).toBe(zoom);
    });

    it("shoud change background layer attribute when background layer changes", async () => {
        const component = new GDIKMap(),
            backgroundLayer = "1002";

        await component.connectedCallback();

        expect(component.getAttribute("active-bg")).toBe(defaultConfig.portal.backgroundLayers[0]);

        component.layerManager.changeBackgroundLayer(backgroundLayer);

        expect(component.getAttribute("active-bg")).toBe(backgroundLayer);
    });
});
