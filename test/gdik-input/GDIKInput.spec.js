import {enableFetchMocks} from "jest-fetch-mock";
enableFetchMocks();

import GDIKInput from "../../src/gdik-input/GDIKInput";

describe("Init gdik-input", () => {

    it("can create gdik-input component", () => {
        expect(GDIKInput).toBeDefined();

        const component = new GDIKInput();

        expect(component).toBeDefined();
    });

    it("should rendered by default without draw component", () => {
        const component = new GDIKInput();

        component.connectedCallback();

        expect(component.shadowRoot.childNodes.length).toBe(1);
        expect(component.shadowRoot.childNodes[0].nodeName).toBe("GDIK-MAP");
        expect(component.shadowRoot.childNodes[0].childNodes.length).toBe(1);
        expect(component.shadowRoot.childNodes[0].childNodes[0].nodeName).toBe("GDIK-LAYERSWITCHER");
    });

    it("should rendered with draw component when draw-type given", () => {
        const component = new GDIKInput();

        component.setAttribute("draw-type", "Point");

        component.connectedCallback();

        expect(component.shadowRoot.childNodes.length).toBe(1);
        expect(component.shadowRoot.childNodes[0].nodeName).toBe("GDIK-MAP");
        expect(component.shadowRoot.childNodes[0].childNodes.length).toBe(2);
        expect(component.shadowRoot.childNodes[0].childNodes[0].nodeName).toBe("GDIK-LAYERSWITCHER");
        expect(component.shadowRoot.childNodes[0].childNodes[1].nodeName).toBe("GDIK-DRAW");

        expect(component.childNodes.length).toBe(1);
        expect(component.childNodes[0].nodeName).toBe("INPUT");
    });

    it("should pass attributes to child components", () => {
        const component = new GDIKInput(),
            lon = "1",
            lat = "2",
            zoom = "8",
            activeBg = "1002",
            drawType = "Point",
            feature = "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[1, 1]}}]}";

        component.setAttribute("lon", lon);
        component.setAttribute("lat", lat);
        component.setAttribute("zoom", zoom);
        component.setAttribute("active-bg", activeBg);
        component.setAttribute("draw-type", drawType);
        component.setAttribute("feature", feature);

        component.connectedCallback();

        expect(component.shadowRoot.childNodes[0].nodeName).toBe("GDIK-MAP");
        expect(component.shadowRoot.childNodes[0].getAttribute("lon")).toBe(lon);
        expect(component.shadowRoot.childNodes[0].getAttribute("lat")).toBe(lat);
        expect(component.shadowRoot.childNodes[0].getAttribute("zoom")).toBe(zoom);
        expect(component.shadowRoot.childNodes[0].getAttribute("active-bg")).toBe(activeBg);

        expect(component.shadowRoot.childNodes[0].childNodes[1].nodeName).toBe("GDIK-DRAW");
        expect(component.shadowRoot.childNodes[0].childNodes[1].getAttribute("draw-type")).toBe(drawType);
        expect(component.shadowRoot.childNodes[0].childNodes[1].getAttribute("feature")).toBe(feature);

        expect(component.childNodes[0].getAttribute("value")).toBe(feature);
    });

    it("should pass attribute changes to child components", () => {
        const component = new GDIKInput(),
            lon = "1",
            lat = "2",
            zoom = "8",
            activeBg = "1002",
            feature = "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[1, 1]}}]}";

        component.setAttribute("draw-type", "Point");

        component.connectedCallback();

        component.setAttribute("lon", lon);
        component.setAttribute("lat", lat);
        component.setAttribute("zoom", zoom);
        component.setAttribute("active-bg", activeBg);
        component.setAttribute("feature", feature);

        expect(component.shadowRoot.childNodes[0].nodeName).toBe("GDIK-MAP");
        expect(component.shadowRoot.childNodes[0].getAttribute("lon")).toBe(lon);
        expect(component.shadowRoot.childNodes[0].getAttribute("lat")).toBe(lat);
        expect(component.shadowRoot.childNodes[0].getAttribute("zoom")).toBe(zoom);
        expect(component.shadowRoot.childNodes[0].getAttribute("active-bg")).toBe(activeBg);

        expect(component.shadowRoot.childNodes[0].childNodes[1].nodeName).toBe("GDIK-DRAW");
        expect(component.shadowRoot.childNodes[0].childNodes[1].getAttribute("feature")).toBe(feature);

        expect(component.childNodes[0].getAttribute("value")).toBe(feature);
    });

    it("should reflect child attribute changes", async () => {
        const mutationObserverMock = jest.fn(function MutationObserver () {
                this.observe = jest.fn();
            }),
            storedMutationObserver = MutationObserver,
            component = new GDIKInput(),
            changedAttributes = {
                lon: "1",
                lat: "2",
                zoom: "8",
                "active-bg": "1002",
                feature: "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[1, 1]}}]}"
            };

        global.MutationObserver = mutationObserverMock;

        component.setAttribute("draw-type", "Point");

        component.connectedCallback();

        expect(mutationObserverMock.mock.instances.length).toBe(1);

        expect(mutationObserverMock.mock.instances[0].observe).toHaveBeenCalledTimes(2);

        Object.keys(changedAttributes).forEach((k) => {
            component.handleObservedAttributeCallback([{target: {getAttribute: () => {
                return changedAttributes[k];
            }}, attributeName: k, type: "attributes"}]);
        });

        expect(component.nodeName).toBe("GDIK-INPUT");
        expect(component.getAttribute("lon")).toBe(changedAttributes.lon);
        expect(component.getAttribute("lat")).toBe(changedAttributes.lat);
        expect(component.getAttribute("zoom")).toBe(changedAttributes.zoom);
        expect(component.getAttribute("active-bg")).toBe(changedAttributes["active-bg"]);
        expect(component.getAttribute("feature")).toBe(changedAttributes.feature);
        expect(component.childNodes[0].getAttribute("value")).toBe(changedAttributes.feature);

        global.MutationObserver = storedMutationObserver;
    });

});