import {enableFetchMocks} from "jest-fetch-mock";
enableFetchMocks();

import Feature from "ol/Feature";
import Point from "ol/geom/Point";

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

        expect(component.shadowRoot.childNodes.length).toBe(2);
        expect(component.shadowRoot.childNodes[0].nodeName).toBe("STYLE");
        expect(component.shadowRoot.childNodes[1].nodeName).toBe("DIV");
        expect(component.shadowRoot.childNodes[1].getAttribute("id")).toMatch(/^gdik-map-div-[a-zA-Z0-9]*$/);

        expect(component.shadowRoot.childNodes[1].firstChild.className).toBe("ol-viewport");
    });

    it("should use values from default config", async () => {
        const component = new GDIKMap();

        await component.connectedCallback();

        expect(Number(component.getAttribute("lon"))).toBe(defaultConfig.portal.startCenter[0]);
        expect(Number(component.getAttribute("lat"))).toBe(defaultConfig.portal.startCenter[1]);

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

        expect(Number(component.getAttribute("lon"))).toBe(customConfig.portal.startCenter[0]);
        expect(Number(component.getAttribute("lat"))).toBe(customConfig.portal.startCenter[1]);

        expect(component.map.getView().getCenter()).toEqual(customConfig.portal.startCenter);

        expect(component.getAttribute("active-bg")).toBe(customConfig.portal.backgroundLayers[0]);
    });

    it("should apply values given by element attributes", async () => {
        const component = new GDIKMap(),
            lon = 450000.0,
            lat = 5500000.0;

        component.setAttribute("lon", lon);
        component.setAttribute("lat", lat);

        await component.connectedCallback();

        expect(Number(component.getAttribute("lon"))).toBe(lon);
        expect(Number(component.getAttribute("lat"))).toBe(lat);

        expect(component.map.getView().getCenter()).toEqual([lon, lat]);
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

        expect(component.getBackgroundLayer().get("id")).toBe(backgroundLayer);
    });

    it("should change background layer when attribute changes", async () => {
        fetch.mockResponseOnce(JSON.stringify(customConfig));
        const component = new GDIKMap(),
            backgroundLayer = "1002";

        component.setAttribute("config-url", "http://config.service/config.json");

        await component.connectedCallback();
        expect(component.getBackgroundLayer().get("id")).toBe("1001");

        component.setAttribute("active-bg", backgroundLayer);

        expect(component.getBackgroundLayer().get("id")).toBe(backgroundLayer);
    });

    it("should log an error when background layer cannot be found on init", async () => {
        const component = new GDIKMap(),
            backgroundLayer = "1003";

        console.error = jest.fn();

        component.setAttribute("active-bg", backgroundLayer);
        await component.connectedCallback();
        expect(console.error.mock.calls[0][0]).toBe("Background layer 1003 cannot be found. Fall back to default background layer");

        expect(component.getAttribute("active-bg", "1001"));
        expect(component.getBackgroundLayer().get("id")).toBe("1001");
    });

    it("should log an error when background layer cannot be found on attribute change", async () => {
        const component = new GDIKMap(),
            backgroundLayer = "1003";

        console.error = jest.fn();

        await component.connectedCallback();

        component.setAttribute("active-bg", backgroundLayer);
        expect(console.error.mock.calls[0][0]).toBe("Layer with id '1003' not found. No layer added to map.");
        expect(console.error.mock.calls[1][0]).toBe("Background layer with id 1003 not found");

        expect(component.getAttribute("active-bg", "1001"));
        expect(component.getBackgroundLayer().get("id")).toBe("1001");
    });
});

describe("Attribute change related", () => {
    it("should change map content on component attribute change", async () => {
        const component = new GDIKMap(),
            lon = 450000.0,
            lat = 5500000.0,
            backgroundLayer = "1002";

        await component.connectedCallback();

        expect(Number(component.getAttribute("lon"))).toBe(defaultConfig.portal.startCenter[0]);
        expect(Number(component.getAttribute("lat"))).toBe(defaultConfig.portal.startCenter[1]);

        expect(component.getAttribute("active-bg")).toBe(defaultConfig.portal.backgroundLayers[0]);

        component.setAttribute("lon", lon);
        component.setAttribute("lat", lat);
        component.setAttribute("active-bg", backgroundLayer);

        expect(component.map.getView().getCenter()).toEqual([lon, lat]);

        expect(component.getBackgroundLayer().get("id")).toBe(backgroundLayer);
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
});

describe("Draw related", () => {

    it("should have draw control with inactive draw interaction added when draw-type set", async () => {
        const component = new GDIKMap();
        let drawInteraction;

        component.setAttribute("draw-type", "Point");

        await component.connectedCallback();

        drawInteraction = component.map.getInteractions().getArray().filter((interaction) => interaction.constructor.name === "Draw");
        expect(drawInteraction.length).toBe(1);
        drawInteraction = drawInteraction[0];
        expect(drawInteraction.getActive()).toBe(true);

        expect(component.shadowRoot.querySelector(".gdik-delete")).not.toBeNull();
    });

    it("should have feature attribute with FeatureCollection containing drawed feature when feature added to draw layer", async () => {
        const component = new GDIKMap();

        component.setAttribute("draw-type", "Point");

        await component.connectedCallback();

        expect(component.hasAttribute("feature")).toBe(false);

        component.drawControl.featureSource.addFeature(new Feature({geometry: new Point([1, 1])}));

        expect(component.hasAttribute("feature")).toBe(true);

        expect(JSON.parse(component.getAttribute("feature"))).toEqual({
            type: "FeatureCollection",
            features: [
                {
                    geometry: {
                        coordinates: [1, 1],
                        type: "Point"
                    },
                    properties: null,
                    type: "Feature"
                }
            ]});
    });

    it("should deactivate draw and activate modify after feature is added to layer", async () => {
        const component = new GDIKMap();
        let drawInteraction, modifyInteraction;

        component.setAttribute("draw-type", "Point");

        await component.connectedCallback();

        drawInteraction = component.map.getInteractions().getArray().filter((interaction) => interaction.constructor.name === "Draw");
        drawInteraction = drawInteraction[0];
        modifyInteraction = component.map.getInteractions().getArray().filter((interaction) => interaction.constructor.name === "Modify");
        modifyInteraction = modifyInteraction[0];

        expect(drawInteraction.getActive()).toBe(true);
        expect(modifyInteraction.getActive()).toBe(false);

        component.drawControl.featureSource.addFeature(new Feature({geometry: new Point([1, 1])}));

        expect(drawInteraction.getActive()).toBe(false);
        expect(modifyInteraction.getActive()).toBe(true);
    });

    it("should have active modify control when passing feature collection with point feature", async () => {
        const inputFeature = "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[1, 1]}}]}",
            component = new GDIKMap();
        let modifyInteraction;

        component.setAttribute("feature", inputFeature);

        await component.connectedCallback();

        modifyInteraction = component.map.getInteractions().getArray().filter((interaction) => interaction.constructor.name === "Modify");

        modifyInteraction = modifyInteraction[0];
        expect(modifyInteraction.getActive()).toBe(true);
    });

    it("should not allow mixed geometry types", async () => {
        const inputFeature = "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[1, 1]}}, {\"type\":\"Feature\",\"geometry\":{\"type\":\"LineString\",\"coordinates\":[[1, 1],[2, 1], [2, 2]]}}]}",
            component = new GDIKMap();

        console.error = jest.fn();
        console.debug = jest.fn();

        component.setAttribute("feature", inputFeature);

        await component.connectedCallback();

        expect(console.error.mock.calls[0][0]).toBe("Failed to create DrawControl");
        expect(console.debug.mock.calls[0][0]).toBe("Original error was Error: Inhomogeneous feature collection given");
    });
});

describe("Layerswitcher related", () => {
    it("should have added layerswitcher control", async () => {
        const component = new GDIKMap();
        let layerswitcherElement = null,
            bgLayers = null;

        await component.connectedCallback();

        layerswitcherElement = component.shadowRoot.querySelector(".gdik-layerswitcher");
        expect(layerswitcherElement).not.toBeNull();

        bgLayers = layerswitcherElement.querySelectorAll("ul li label");
        expect(bgLayers.length).toBe(1);

        expect(bgLayers[0].innerHTML).toBe("WebAtlasDe");
    });
});