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

        expect(component.getVisibleLayers()[0].get("id")).toBe(layer);
    });

    it("should change map content on component attribute change", async () => {
        const component = new GDIKMap(),
            lon = 450000.0,
            lat = 5500000.0,
            layer = "1002";

        await component.connectedCallback();

        expect(Number(component.getAttribute("lon"))).toBe(defaultConfig.portal.startCenter[0]);
        expect(Number(component.getAttribute("lat"))).toBe(defaultConfig.portal.startCenter[1]);

        expect(component.getAttribute("layer")).toBe(defaultConfig.portal.layers[0].id);

        component.setAttribute("lon", lon);
        component.setAttribute("lat", lat);
        component.setAttribute("layer", layer);

        expect(component.map.getView().getCenter()).toEqual([lon, lat]);

        expect(component.getVisibleLayers()[0].get("id")).toBe(layer);
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

    it("should have active draw interaction when draw-type set", async () => {
        const component = new GDIKMap();
        let drawInteraction;

        component.setAttribute("draw-type", "point");

        await component.connectedCallback();

        drawInteraction = component.map.getInteractions().getArray().filter((interaction) => interaction === component.drawInteraction);
        expect(drawInteraction.length).toBe(1);
        drawInteraction = drawInteraction[0];
        expect(drawInteraction.getActive()).toBe(true);
    });

    it("should have feature attribute with FeatureCollection containing drawed feature when feature added to draw layer", async () => {
        const component = new GDIKMap();

        component.setAttribute("draw-type", "point");

        await component.connectedCallback();

        expect(component.hasAttribute("feature")).toBe(false);

        component.featureSource.addFeature(new Feature({geometry: new Point([1, 1])}));

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
});