import mapsAPI from "masterportalAPI/src/maps/api.js";

import Feature from "ol/Feature";
import Point from "ol/geom/Point";

import LayerManager from "../../../src/components/gdik-map/LayerManager";
import GDIKDraw from "../../../src/components/gdik-draw/GDIKDraw";

import * as defaultConfig from "../../../src/components/gdik-map/assets/config.json";

describe("Draw related", () => {

    let map, layerManager;

    beforeEach(() => {
        map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D");
        layerManager = new LayerManager(map, defaultConfig.portal.backgroundLayers);
    });

    it("should have draw control with inactive draw interaction added when draw-type set", () => {
        const component = new GDIKDraw();
        let drawInteraction;

        component.setAttribute("draw-type", "Point");
        component.registerGDIKMap(map, layerManager);

        drawInteraction = map.getInteractions().getArray().filter((interaction) => interaction.constructor.name === "Draw");
        expect(drawInteraction.length).toBe(1);
        drawInteraction = drawInteraction[0];
        expect(drawInteraction.getActive()).toBe(true);

        expect(component.control.element.className).toBe("ol-control gdik-delete");
    });

    it("should have feature attribute with FeatureCollection containing drawed feature when feature added to draw layer", () => {
        const component = new GDIKDraw();

        component.setAttribute("draw-type", "Point");
        component.registerGDIKMap(map, layerManager);

        expect(component.hasAttribute("feature")).toBe(false);

        component.control.featureSource.addFeature(new Feature({geometry: new Point([1, 1])}));

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

    it("shouldn't have feature attrubute when drawed feature was removed", async () => {
        const component = new GDIKDraw(),
            feature = new Feature({geometry: new Point([1, 1])});

        component.setAttribute("draw-type", "Point");
        component.registerGDIKMap(map, layerManager);

        expect(component.hasAttribute("feature")).toBe(false);

        component.control.featureSource.addFeature(feature);
        expect(component.control.featureSource.getFeatures()[0]).toBe(feature);
        expect(component.hasAttribute("feature")).toBe(true);

        component.control.featureSource.removeFeature(feature);
        expect(component.hasAttribute("feature")).toBe(true);
        expect(component.getAttribute("feature")).toBe("");
    });

    it("should deactivate draw and activate modify after feature is added to layer", async () => {
        const component = new GDIKDraw();
        let drawInteraction, modifyInteraction;

        component.setAttribute("draw-type", "Point");
        component.registerGDIKMap(map, layerManager);

        drawInteraction = map.getInteractions().getArray().filter((interaction) => interaction.constructor.name === "Draw");
        drawInteraction = drawInteraction[0];
        modifyInteraction = map.getInteractions().getArray().filter((interaction) => interaction.constructor.name === "Modify");
        modifyInteraction = modifyInteraction[0];

        expect(drawInteraction.getActive()).toBe(true);
        expect(modifyInteraction.getActive()).toBe(false);

        component.control.featureSource.addFeature(new Feature({geometry: new Point([1, 1])}));

        expect(drawInteraction.getActive()).toBe(false);
        expect(modifyInteraction.getActive()).toBe(true);
    });

    it("should have active modify control when passing feature collection with point feature", async () => {
        const inputFeature = "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[1, 1]}}]}",
            component = new GDIKDraw();
        let modifyInteraction;

        component.setAttribute("feature", inputFeature);
        component.registerGDIKMap(map, layerManager);

        modifyInteraction = map.getInteractions().getArray().filter((interaction) => interaction.constructor.name === "Modify");

        modifyInteraction = modifyInteraction[0];
        expect(modifyInteraction.getActive()).toBe(true);
    });

    it("should not allow mixed geometry types", async () => {
        const inputFeature = "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[1, 1]}}, {\"type\":\"Feature\",\"geometry\":{\"type\":\"LineString\",\"coordinates\":[[1, 1],[2, 1], [2, 2]]}}]}",
            component = new GDIKDraw();

        component.setAttribute("feature", inputFeature);

        expect(() => {
            component.registerGDIKMap(map, layerManager);
        }).toThrow("Inhomogeneous feature collection given");
    });

    it("should update feature on feature attibute change", async () => {
        const initalFeature = "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[1, 1]}}]}",
            updatedFeature = "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[2, 2]}}]}",
            component = new GDIKDraw();


        component.setAttribute("feature", initalFeature);
        component.registerGDIKMap(map, layerManager);


        component.setAttribute("feature", updatedFeature);

        expect(component.control.featureSource.getFeatures().length).toBe(1);
        expect(component.control.featureSource.getFeatures()[0].getGeometry().getType()).toBe("Point");
        expect(component.control.featureSource.getFeatures()[0].getGeometry().getCoordinates()).toEqual([2, 2]);
    });
});

