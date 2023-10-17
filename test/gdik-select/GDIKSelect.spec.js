import {enableFetchMocks} from "jest-fetch-mock";
enableFetchMocks();

import GDIKSelect from "../../src/gdik-select/GDIKSelect";

// https://www.thinktecture.com/web-components/web-components-flaws/
// https://www.webcomponents.org/community/articles/web-components-best-practices

describe("Init gdik-select", () => {
    it("can create gdik-select component", () => {
        expect(GDIKSelect).toBeDefined();

        const component = new GDIKSelect();

        expect(component).toBeDefined();
    });

    it("should rendered by default with select component", () => {
        const component = new GDIKSelect();

        component.connectedCallback();

        expect(component.shadowRoot.childNodes.length).toBe(1);
        expect(component.shadowRoot.childNodes[0].nodeName).toBe("GCS-MAP");
        expect(component.shadowRoot.childNodes[0].childNodes.length).toBe(3);
        expect(component.shadowRoot.childNodes[0].childNodes[0].nodeName).toBe("GCS-LAYERSWITCHER");
        expect(component.shadowRoot.childNodes[0].childNodes[1].nodeName).toBe("GCS-SELECT");
        expect(component.shadowRoot.childNodes[0].childNodes[2].nodeName).toBe("GCS-GEOLOCATION");
    });


    it("should pass attributes to child components", () => {
        const component = new GDIKSelect(),
            lon = "1",
            lat = "2",
            zoom = "8",
            activeBg = "1002",
            lng = "en";

        component.setAttribute("lon", lon);
        component.setAttribute("lat", lat);
        component.setAttribute("zoom", zoom);
        component.setAttribute("active-bg", activeBg);
        component.setAttribute("lng", lng);

        component.connectedCallback();

        expect(component.shadowRoot.childNodes[0].nodeName).toBe("GCS-MAP");
        expect(component.shadowRoot.childNodes[0].getAttribute("lon")).toBe(lon);
        expect(component.shadowRoot.childNodes[0].getAttribute("lat")).toBe(lat);
        expect(component.shadowRoot.childNodes[0].getAttribute("zoom")).toBe(zoom);
        expect(component.shadowRoot.childNodes[0].getAttribute("active-bg")).toBe(activeBg);
        expect(component.shadowRoot.childNodes[0].getAttribute("lng")).toBe(lng);

        expect(component.shadowRoot.childNodes[0].childNodes[1].nodeName).toBe("GCS-SELECT");
        expect(component.shadowRoot.childNodes[0].childNodes[1].getAttribute("feature")).toBe(null);
    });

    it("should pass attribute changes to child components", () => {
        const component = new GDIKSelect(),
            lon = "1",
            lat = "2",
            zoom = "8",
            activeBg = "1002",
            lng = "en";

        component.connectedCallback();

        component.setAttribute("lon", lon);
        component.setAttribute("lat", lat);
        component.setAttribute("zoom", zoom);
        component.setAttribute("active-bg", activeBg);
        component.setAttribute("lng", lng);

        expect(component.shadowRoot.childNodes[0].nodeName).toBe("GCS-MAP");
        expect(component.shadowRoot.childNodes[0].getAttribute("lon")).toBe(lon);
        expect(component.shadowRoot.childNodes[0].getAttribute("lat")).toBe(lat);
        expect(component.shadowRoot.childNodes[0].getAttribute("zoom")).toBe(zoom);
        expect(component.shadowRoot.childNodes[0].getAttribute("active-bg")).toBe(activeBg);
        expect(component.shadowRoot.childNodes[0].getAttribute("lng")).toBe(lng);

        expect(component.shadowRoot.childNodes[0].childNodes[1].nodeName).toBe("GCS-SELECT");
        expect(component.shadowRoot.childNodes[0].childNodes[1].getAttribute("feature")).toBe(null);
    });

    it("should reflect child attribute changes", async () => {
        const mutationObserverMock = jest.fn(function MutationObserver () {
                this.observe = jest.fn();
            }),
            storedMutationObserver = MutationObserver,
            component = new GDIKSelect(),
            changedAttributes = {
                lon: "1",
                lat: "2",
                zoom: "8",
                "active-bg": "1002",
                "search-string": "search-string",
                lng: "en"
            };

        global.MutationObserver = mutationObserverMock;

        component.connectedCallback();

        expect(mutationObserverMock.mock.instances.length).toBe(1);

        expect(mutationObserverMock.mock.instances[0].observe).toHaveBeenCalledTimes(2);

        Object.keys(changedAttributes).forEach((k) => {
            component.handleObservedAttributeCallback([{target: {getAttribute: () => {
                return changedAttributes[k];
            }}, attributeName: k, type: "attributes"}]);
        });

        expect(component.nodeName).toBe("GDIK-SELECT");
        expect(component.getAttribute("lon")).toBe(changedAttributes.lon);
        expect(component.getAttribute("lat")).toBe(changedAttributes.lat);
        expect(component.getAttribute("zoom")).toBe(changedAttributes.zoom);
        expect(component.getAttribute("active-bg")).toBe(changedAttributes["active-bg"]);
        expect(component.getAttribute("search-string")).toBe(changedAttributes["search-string"]);
        expect(component.getAttribute("lng")).toBe(changedAttributes.lng);

        global.MutationObserver = storedMutationObserver;
    });


});

describe("value assignment", () => {
    const featureCollection = {"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [1, 1]}}]},
        value = JSON.stringify(featureCollection);

    it("should set state when child state is changed", async () => {
        const component = new GDIKSelect();

        component.connectedCallback();

        component.handleObservedAttributeCallback([{target: {getAttribute: () => {
            return value;
        }}, attributeName: "feature", type: "attributes"}]);

        expect(component.value).toEqual(featureCollection);
        expect(component.getAttribute("value")).toBe(value);
        expect(component.childNodes[0].getAttribute("value")).toBe(value);
        expect(component.shadowRoot.childNodes[0].childNodes[1].getAttribute("feature")).toBe(value);
    });

    it("should emit events when value is changed by child", async () => {
        const component = new GDIKSelect(),
            dispatchEventSpy = jest.spyOn(component, "dispatchEvent");

        component.connectedCallback();

        component.handleObservedAttributeCallback([{target: {getAttribute: () => {
            return value;
        }}, attributeName: "feature", type: "attributes"}]);

        expect(dispatchEventSpy).toHaveBeenCalledTimes(2);
    });

    it("should pass changed value in emitted event", async () => {
        const component = new GDIKSelect(),
            dispatchEventSpy = jest.spyOn(component, "dispatchEvent");

        component.connectedCallback();

        component.handleObservedAttributeCallback([{target: {getAttribute: () => {
            return value;
        }}, attributeName: "feature", type: "attributes"}]);

        expect(dispatchEventSpy).toHaveBeenCalledTimes(2);

        // eslint-disable-next-line one-var
        const mockCalls = dispatchEventSpy.mock.calls;

        expect(mockCalls[0][0]).toBeInstanceOf(InputEvent);
        expect(mockCalls[1][0]).toBeInstanceOf(CustomEvent);

        // eslint-disable-next-line one-var
        const inputEvent = mockCalls[0][0],
            changeEvent = mockCalls[1][0];

        expect(inputEvent.type).toBe("input");
        expect(inputEvent.data).toEqual(value);

        expect(changeEvent.type).toBe("change");
        expect(changeEvent.detail).toEqual(featureCollection);
    });

    it("should unset value when child value is removed", async () => {
        const component = new GDIKSelect(),
            dispatchEventSpy = jest.spyOn(component, "dispatchEvent");

        component.connectedCallback();

        component.handleObservedAttributeCallback([{target: {getAttribute: () => {
            return "";
        }}, attributeName: "feature", type: "attributes"}]);

        expect(dispatchEventSpy).toHaveBeenCalledTimes(2);

        // eslint-disable-next-line one-var
        const mockCalls = dispatchEventSpy.mock.calls;

        expect(mockCalls[0][0]).toBeInstanceOf(InputEvent);
        expect(mockCalls[1][0]).toBeInstanceOf(CustomEvent);

        // eslint-disable-next-line one-var
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

});

describe("config file handling", () => {

    beforeEach(() => {
        fetch.resetMocks();
    });

    it("should load given config url", async () => {
        const component = new GDIKSelect(),
            configUrl = "https://config";

        component.setAttribute("config-url", configUrl);

        await component.connectedCallback();

        // TODO check fetch called

        expect(component.shadowRoot.childNodes[0].nodeName).toBe("GCS-MAP");
        expect(component.shadowRoot.childNodes[0].getAttribute("config-url")).toBe(configUrl);
    });

    it.todo("should add search component when searchUrl defined in loaded config");

    it.todo("should not break when a gdik-input config is passed");
});
