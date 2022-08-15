import LayerswitcherControl from "../../../../src/components/gdik-map/controls/layerswitcher";

describe("Layerswitcher", () => {

    it("should init layerswitcher", () => {
        expect(LayerswitcherControl).toBeDefined();

        const control = new LayerswitcherControl({backgroundLayers: ["1001", "1002"]});

        expect(control.element.className).toBe("ol-control gdik-layerswitcher");
        expect(control.element.firstChild.nodeName).toBe("UL");
        expect(control.element.firstChild.childElementCount).toBe(2);
    });
});