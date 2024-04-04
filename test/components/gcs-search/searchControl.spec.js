import mapsAPI from "masterportalAPI/src/maps/api.js";

import SearchControl from "../../../src/components/gcs-search/searchControl";
import * as defaultConfig from "../../../src/components/gcs-map/assets/config.json";
import * as searchResult from "./assets/searchResults.json";

describe("Search", () => {
    const options = {
        searchUrl: "https://search",
        searchString: "Stade"
    };

    let map;

    fetch.mockResponse(JSON.stringify(searchResult));

    beforeEach(() => {
        map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D");
    });

    it("should have added search control", () => {
        expect(SearchControl).toBeDefined();

        const control = new SearchControl(options);

        expect(control.element.className).toBe("ol-control gcs-search");
        expect(control.element.children.length).toBe(2);
        expect(control.element.firstChild.nodeName).toBe("INPUT");
        expect(control.element.lastChild.nodeName).toBe("DIV");
        expect(control.element.lastChild.className).toBe("gcs-search-results");
    });

    it("should start search on enter press", () => {
        const control = new SearchControl(options);

        map.addControl(control);

        control.element.firstChild.value = options.searchString;
        // simulate enter pressed in input element
        control.handleSearch({keyCode: 13, target: control.element.firstChild, preventDefault: () => {
            // noop
        }, stopPropagation: () => {
            // noop
        }});

        expect(fetch).toBeCalledWith("https://search?outputformat=json&srsName=EPSG:25832&query=" + options.searchString + "&count=5");
    });

    it("should render search results", () => {
        const control = new SearchControl(options);

        control.renderResponse(searchResult);

        expect(control.element.lastChild.children.length).toBe(5);

        for (let i = 0; i < control.element.lastChild.children.length; i++) {
            expect(control.element.lastChild.children[i].innerHTML).toBe(searchResult.features[i].properties.text);
        }
    });

    it("should move map to search result coordinate and show selected search text", () => {
        const control = new SearchControl(options),
            resultText = "teststring",
            resultCoord = [450010.0, 5500010.0];

        map.addControl(control);

        control.showResult(resultText, resultCoord);

        expect(control.element.firstChild.value).toBe(resultText);


        expect(map.getView().getCenter()).toEqual(resultCoord);
        // default fallback zoom level
        expect(map.getView().getZoom()).toBe(11);
    });

    it("should move to search result bbox instead of coordinate and fit zoom to bbox", () => {
        const control = new SearchControl(options),
            resultText = "teststring",
            resultCoord = [450010.0, 5500010.0],
            resultBBox = [441632.41251335153, 5881752.268513008, 452479.6627111422, 5895430.011182868];

        map.addControl(control);

        control.showResult(resultText, resultCoord, resultBBox);

        expect(control.element.firstChild.value).toBe(resultText);

        expect(map.getView().getCenter()).toEqual([447056.0376122469, 5888591.139847938]);
        // default fallback zoom level
        expect(map.getView().getZoom()).toBe(3);
    });

    it("should zoom map to defined zoom level", () => {
        const fallbackResultZoomLevel = 10,
            control = new SearchControl({fallbackResultZoomLevel: fallbackResultZoomLevel, ...options}),
            resultText = "teststring",
            resultCoord = [450010.0, 5500010.0];

        map.addControl(control);

        control.showResult(resultText, resultCoord);

        expect(control.element.firstChild.value).toBe(resultText);


        expect(map.getView().getCenter()).toEqual(resultCoord);
        expect(map.getView().getZoom()).toBe(fallbackResultZoomLevel);
    });

});