import DrawControl from "../../../../src/components/gdik-map/controls/draw";

describe("Draw Control", () => {
    it("can create", () => {
        expect(DrawControl).toBeDefined();

        const control = new DrawControl();

        expect(control).toBeDefined();
    });
});