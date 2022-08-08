import Feature from "ol/Feature";
import Point from "ol/geom/Point";

import DrawControl from "../../../../src/components/gdik-map/controls/draw";

import Map from "ol/Map";

describe("Draw Control", () => {

    it("should raise an error when no draw type is given or draw type is not supported", () => {
        expect(DrawControl).toBeDefined();

        let thrownError;

        try {
            new DrawControl();
        }
        catch (err) {
            thrownError = err;
        }

        expect(thrownError.toString()).toBe("Error: Missing draw type");

        try {
            new DrawControl({drawType: "Punkt"});
        }
        catch (err) {
            thrownError = err;
        }

        expect(thrownError.toString()).toBe("Error: Unsupported draw type \"Punkt\"");

    });

    it("should init draw control", () => {
        const control = new DrawControl({drawType: "Point"});

        expect(control.element.className).toBe("ol-control gdik-delete");
        expect(control.element.firstChild.nodeName).toBe("BUTTON");

        expect(control.drawInteraction).toBeDefined();

        expect(control.featureSource).toBeDefined();
    });

    it("should toggle controls depending on feature source", () => {
        const control = new DrawControl({drawType: "Point"}),
            map = new Map(),
            feature = new Feature({geometry: new Point([1, 1])}),
            addInteractionSpy = jest.spyOn(map, "addInteraction");

        control.setMap(map);

        expect(addInteractionSpy).toHaveBeenCalledTimes(2);

        // Initial state, no feature in source
        expect(control.element.firstChild.nodeName).toBe("BUTTON");
        expect(control.element.firstChild.disabled).toBe(true);
        expect(control.drawInteraction.getActive()).toBe(true);
        expect(control.modifyInteraction.getActive()).toBe(false);

        control.featureSource.addFeature(feature);

        // State after feature added to source
        expect(control.element.firstChild.disabled).toBe(false);
        expect(control.drawInteraction.getActive()).toBe(false);
        expect(control.modifyInteraction.getActive()).toBe(true);

        control.featureSource.removeFeature(feature);

        // State after feature removed from source
        expect(control.element.firstChild.disabled).toBe(true);
        expect(control.drawInteraction.getActive()).toBe(true);
        expect(control.modifyInteraction.getActive()).toBe(false);

    });

    it("should add features of given feature collection to feature source", () => {
        const control = new DrawControl({featureCollection: {"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [1, 1]}}]}});

        expect(control.featureSource.getFeatures().length).toBe(1);
        expect(control.featureSource.getFeatures()[0].getGeometry().getType()).toBe("Point");
        expect(control.featureSource.getFeatures()[0].getGeometry().getCoordinates()).toEqual([1, 1]);
    });
});