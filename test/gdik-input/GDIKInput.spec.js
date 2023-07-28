import {enableFetchMocks} from "jest-fetch-mock";
enableFetchMocks();

import GDIKInput from "../../src/gdik-input/GDIKInput";

describe("Init gdik-input", () => {
    const featureCollection = {"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [1, 1]}}]},
        value = JSON.stringify(featureCollection);

    it("can create gdik-input component", () => {
        expect(GDIKInput).toBeDefined();

        const component = new GDIKInput();

        expect(component).toBeDefined();
    });

    it("should rendered by default without draw component", () => {
        const component = new GDIKInput();

        component.connectedCallback();

        expect(component.shadowRoot.childNodes.length).toBe(1);
        expect(component.shadowRoot.childNodes[0].nodeName).toBe("GCS-MAP");
        expect(component.shadowRoot.childNodes[0].childNodes.length).toBe(2);
        expect(component.shadowRoot.childNodes[0].childNodes[0].nodeName).toBe("GCS-LAYERSWITCHER");
        expect(component.shadowRoot.childNodes[0].childNodes[1].nodeName).toBe("GCS-GEOLOCATION");
    });

    it("should rendered with draw component when draw-type given", () => {
        const component = new GDIKInput();

        component.setAttribute("draw-type", "Point");

        component.connectedCallback();

        expect(component.shadowRoot.childNodes.length).toBe(1);
        expect(component.shadowRoot.childNodes[0].nodeName).toBe("GCS-MAP");
        expect(component.shadowRoot.childNodes[0].childNodes.length).toBe(3);
        expect(component.shadowRoot.childNodes[0].childNodes[0].nodeName).toBe("GCS-LAYERSWITCHER");
        expect(component.shadowRoot.childNodes[0].childNodes[1].nodeName).toBe("GCS-DRAW");
        expect(component.shadowRoot.childNodes[0].childNodes[2].nodeName).toBe("GCS-GEOLOCATION");

        expect(component.childNodes.length).toBe(1);
        expect(component.childNodes[0].nodeName).toBe("INPUT");
    });

    it("should pass attributes to child components", () => {
        const component = new GDIKInput(),
            lon = "1",
            lat = "2",
            zoom = "8",
            activeBg = "1002",
            drawType = "Point";

        component.setAttribute("lon", lon);
        component.setAttribute("lat", lat);
        component.setAttribute("zoom", zoom);
        component.setAttribute("active-bg", activeBg);
        component.setAttribute("draw-type", drawType);
        component.setAttribute("value", value);

        component.connectedCallback();

        expect(component.shadowRoot.childNodes[0].nodeName).toBe("GCS-MAP");
        expect(component.shadowRoot.childNodes[0].getAttribute("lon")).toBe(lon);
        expect(component.shadowRoot.childNodes[0].getAttribute("lat")).toBe(lat);
        expect(component.shadowRoot.childNodes[0].getAttribute("zoom")).toBe(zoom);
        expect(component.shadowRoot.childNodes[0].getAttribute("active-bg")).toBe(activeBg);

        expect(component.shadowRoot.childNodes[0].childNodes[1].nodeName).toBe("GCS-DRAW");
        expect(component.shadowRoot.childNodes[0].childNodes[1].getAttribute("draw-type")).toBe(drawType);
        expect(component.shadowRoot.childNodes[0].childNodes[1].getAttribute("feature")).toBe(value);

        expect(component.childNodes[0].getAttribute("value")).toBe(value);
        expect(component.value).toEqual(featureCollection);
    });

    it("should pass attribute changes to child components", () => {
        const component = new GDIKInput(),
            lon = "1",
            lat = "2",
            zoom = "8",
            activeBg = "1002";

        component.setAttribute("draw-type", "Point");

        component.connectedCallback();

        component.setAttribute("lon", lon);
        component.setAttribute("lat", lat);
        component.setAttribute("zoom", zoom);
        component.setAttribute("active-bg", activeBg);
        component.setAttribute("value", value);

        expect(component.shadowRoot.childNodes[0].nodeName).toBe("GCS-MAP");
        expect(component.shadowRoot.childNodes[0].getAttribute("lon")).toBe(lon);
        expect(component.shadowRoot.childNodes[0].getAttribute("lat")).toBe(lat);
        expect(component.shadowRoot.childNodes[0].getAttribute("zoom")).toBe(zoom);
        expect(component.shadowRoot.childNodes[0].getAttribute("active-bg")).toBe(activeBg);

        expect(component.shadowRoot.childNodes[0].childNodes[1].nodeName).toBe("GCS-DRAW");
        expect(component.shadowRoot.childNodes[0].childNodes[1].getAttribute("feature")).toBe(value);

        expect(component.childNodes[0].getAttribute("value")).toBe(value);
        expect(component.value).toEqual(featureCollection);
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
                value: value,
                "search-string": "search-string"
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
        expect(component.getAttribute("search-string")).toBe(changedAttributes["search-string"]);
        expect(component.getAttribute("value")).toBe(changedAttributes.value);
        expect(component.childNodes[0].getAttribute("value")).toBe(changedAttributes.value);
        expect(component.value).toEqual(featureCollection);

        global.MutationObserver = storedMutationObserver;
    });


});

describe("value assignment", () => {
    const featureCollection = {"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [1, 1]}}]},
        featureCollection2 = {"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [2, 2]}}]},
        value = JSON.stringify(featureCollection),
        value2 = JSON.stringify(featureCollection2);

    it("should set state by value on init", async () => {
        const component = new GDIKInput();

        component.setAttribute("draw-type", "Point");
        component.setAttribute("value", value);
        component.connectedCallback();

        expect(component.value).toEqual(featureCollection);
        expect(component.getAttribute("value")).toBe(value);
        expect(component.childNodes[0].getAttribute("value")).toBe(value);
        expect(component.shadowRoot.childNodes[0].childNodes[1].getAttribute("feature")).toBe(value);
    });

    it("should set state by value at runtime", async () => {
        const component = new GDIKInput();

        component.setAttribute("draw-type", "Point");
        component.connectedCallback();
        component.setAttribute("value", value);

        expect(component.value).toEqual(featureCollection);
        expect(component.getAttribute("value")).toBe(value);
        expect(component.childNodes[0].getAttribute("value")).toBe(value);
        expect(component.shadowRoot.childNodes[0].childNodes[1].getAttribute("feature")).toBe(value);
    });

    it("should set state by changed value", async () => {
        const component = new GDIKInput();

        component.setAttribute("draw-type", "Point");
        component.setAttribute("value", value);
        component.connectedCallback();
        component.setAttribute("value", value2);

        expect(component.value).toEqual(featureCollection2);
        expect(component.getAttribute("value")).toBe(value2);
        expect(component.childNodes[0].getAttribute("value")).toBe(value2);
        expect(component.shadowRoot.childNodes[0].childNodes[1].getAttribute("feature")).toBe(value2);
    });

    it("should set state when child state is changed", async () => {
        const component = new GDIKInput();

        component.setAttribute("draw-type", "Point");
        component.connectedCallback();

        component.handleObservedAttributeCallback([{target: {getAttribute: () => {
            return value;
        }}, attributeName: "feature", type: "attributes"}]);

        expect(component.value).toEqual(featureCollection);
        expect(component.getAttribute("value")).toBe(value);
        expect(component.childNodes[0].getAttribute("value")).toBe(value);
        expect(component.shadowRoot.childNodes[0].childNodes[1].getAttribute("feature")).toBe(value);
    });

    it("should not emit events when value is given before component init", async () => {
        const component = new GDIKInput(),
            dispatchEventSpy = jest.spyOn(component, "dispatchEvent");

        component.setAttribute("draw-type", "Point");
        component.setAttribute("value", value);
        component.connectedCallback();

        expect(dispatchEventSpy).not.toHaveBeenCalled();
    });

    it("should not emit events when component value is set from outside", async () => {
        const component = new GDIKInput(),
            dispatchEventSpy = jest.spyOn(component, "dispatchEvent");

        component.setAttribute("draw-type", "Point");
        component.connectedCallback();
        component.setAttribute("value", value);

        expect(dispatchEventSpy).not.toHaveBeenCalled();

        expect(component.value).toEqual(featureCollection);
        expect(component.getAttribute("value")).toBe(value);
        expect(component.childNodes[0].getAttribute("value")).toBe(value);
        expect(component.shadowRoot.childNodes[0].childNodes[1].getAttribute("feature")).toBe(value);

    });

    it("should emit events when value is changed by child", async () => {
        const component = new GDIKInput(),
            dispatchEventSpy = jest.spyOn(component, "dispatchEvent");

        component.setAttribute("draw-type", "Point");
        component.connectedCallback();

        component.handleObservedAttributeCallback([{target: {getAttribute: () => {
            return value;
        }}, attributeName: "feature", type: "attributes"}]);

        expect(dispatchEventSpy).toHaveBeenCalledTimes(2);
    });

    it("should pass changed value in emitted event", async () => {
        const component = new GDIKInput(),
            dispatchEventSpy = jest.spyOn(component, "dispatchEvent");

        component.setAttribute("draw-type", "Point");
        component.connectedCallback();

        component.handleObservedAttributeCallback([{target: {getAttribute: () => {
            return value;
        }}, attributeName: "feature", type: "attributes"}]);

        expect(dispatchEventSpy).toHaveBeenCalledTimes(2);

        const mockCalls = dispatchEventSpy.mock.calls;

        expect(mockCalls[0][0]).toBeInstanceOf(InputEvent);
        expect(mockCalls[1][0]).toBeInstanceOf(CustomEvent);

        const inputEvent = mockCalls[0][0],
            changeEvent = mockCalls[1][0];

        expect(inputEvent.type).toBe("input");
        expect(inputEvent.data).toEqual(value);

        expect(changeEvent.type).toBe("change");
        expect(changeEvent.detail).toEqual(featureCollection);
    });

    it("should unset value when child value is removed", async () => {
        const component = new GDIKInput(),
            dispatchEventSpy = jest.spyOn(component, "dispatchEvent");

        component.setAttribute("draw-type", "Point");
        component.connectedCallback();

        component.handleObservedAttributeCallback([{target: {getAttribute: () => {
            return "";
        }}, attributeName: "feature", type: "attributes"}]);

        expect(dispatchEventSpy).toHaveBeenCalledTimes(2);

        const mockCalls = dispatchEventSpy.mock.calls;

        expect(mockCalls[0][0]).toBeInstanceOf(InputEvent);
        expect(mockCalls[1][0]).toBeInstanceOf(CustomEvent);

        const inputEvent = mockCalls[0][0],
            changeEvent = mockCalls[1][0];

        expect(inputEvent.type).toBe("input");
        expect(inputEvent.data).toEqual("");

        expect(changeEvent.type).toBe("change");
        expect(changeEvent.detail).toEqual(null);

        expect(component.value).toEqual(null);
        expect(component.getAttribute("value")).toBe("");
        expect(component.childNodes[0].getAttribute("value")).toBe("");
        expect(component.shadowRoot.childNodes[0].childNodes[1].getAttribute("feature")).toBe("");
    });

    it("should not break when value is set to nonsense at runtime", async () => {
        const component = new GDIKInput();

        component.setAttribute("draw-type", "Point");
        component.setAttribute("value", "foobar");
        component.connectedCallback();

        expect(component.value).toEqual(null);
        expect(component.getAttribute("value")).toBe("foobar");
        expect(component.childNodes[0].getAttribute("value")).toBe("");
        expect(component.shadowRoot.childNodes[0].childNodes[1].getAttribute("feature")).toBe("");
    });

    it("should not break when value is set to nonsense at runtime", async () => {
        const component = new GDIKInput(),
            dispatchEventSpy = jest.spyOn(component, "dispatchEvent");

        component.setAttribute("draw-type", "Point");
        component.connectedCallback();
        component.setAttribute("value", "foobar");

        expect(dispatchEventSpy).not.toHaveBeenCalled();

        expect(component.value).toEqual(null);
        expect(component.getAttribute("value")).toBe("foobar");
        expect(component.childNodes[0].getAttribute("value")).toBe("");
        expect(component.shadowRoot.childNodes[0].childNodes[1].getAttribute("feature")).toBe("");
    });
});

describe("config file handling", () => {

    beforeEach(() => {
        fetch.resetMocks();
    });

    it("should load given config url", async () => {
        const component = new GDIKInput(),
            configUrl = "https://config";

        component.setAttribute("config-url", configUrl);

        await component.connectedCallback();

        expect(component.shadowRoot.childNodes[0].nodeName).toBe("GCS-MAP");
        expect(component.shadowRoot.childNodes[0].getAttribute("config-url")).toBe(configUrl);
    });
});