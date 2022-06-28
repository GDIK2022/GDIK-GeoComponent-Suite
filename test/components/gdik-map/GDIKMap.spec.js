import { GDIKMap } from "../../../src/components";

describe("Init gdik-map", () => {
  it("can create gdik-map component", () => {
    expect(GDIKMap).toBeDefined();

    const component = new GDIKMap();
    expect(component).toBeDefined();
  });
});