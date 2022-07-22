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

    it("should disable draw and enable modify and remove when feature added", () => {
        const control = new DrawControl({drawType: "Point"}),
            map = new Map(),
            addInteractionSpy = jest.spyOn(map, "addInteraction");

        control.setMap(map);

        expect(addInteractionSpy).toHaveBeenCalledTimes(2);

        expect(control.element.firstChild.nodeName).toBe("BUTTON");
        expect(control.element.firstChild.disabled).toBe(true);
        expect(control.drawInteraction.getActive()).toBe(true);
        expect(control.modifyInteraction.getActive()).toBe(false);

        control.featureSource.addFeature(new Feature({geometry: new Point([1, 1])}));

        expect(control.element.firstChild.disabled).toBe(false);
        expect(control.drawInteraction.getActive()).toBe(false);
        expect(control.modifyInteraction.getActive()).toBe(true);

    });
});