import { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();

import GDIKMap from "../../../src/components/gdik-map/GDIKMap";
import * as defaultConfig from "../../../src/components/gdik-map/assets/config.json";
import * as customConfig from "./assets/config.json";

describe("Init gdik-map", () => {

    beforeEach(() => {
        fetch.resetMocks();
    })

    it("can create gdik-map component", () => {
        expect(GDIKMap).toBeDefined();

        const component = new GDIKMap();

        expect(component).toBeDefined();
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
});