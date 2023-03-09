import OSGTS from "../../../../src/components/gcs-search/type/osgts.js";

import {enableFetchMocks} from "jest-fetch-mock";
enableFetchMocks();

describe("OpenSearch Geo and Time Extensions", () => {
    const options = {
            searchUrl: "https://search",
            srs: "epsg:25832"
        },
        searchResult = {type: "FeatureCollection", crs: {type: "name", properties: {name: "EPSG:25832"}}, features: [{type: "Feature", bbox: [441632.41251335153, 5881752.268513008, 452479.6627111422, 5895430.011182868], geometry: {type: "Point", coordinates: [447355.14539, 5888136.62682]}, properties: {text: "Oldenburg(Oldb)", typ: "Ort", score: 1.8784628, bbox: {type: "Polygon", coordinates: [[[441632.41251, 5881870.58292], [441797.43513, 5895430.01118], [452479.66271, 5895311.84302], [452344.93008, 5881752.26851], [441632.41251, 5881870.58292]]]}, ags: "03403000", rs: "034030000000", schluessel: "0340300000000000", bundesland: "Niedersachsen", regbezirk: "Weser-Ems", kreis: "Oldenburg(Oldb), Kreisfreie Stadt", verwgem: "Oldenburg (Oldb)", gemeinde: "Oldenburg (Oldenb.), Stadt", ort: "Oldenburg(Oldb)", ortsteil: ""}, id: "DEGAC00000081439"}, {type: "Feature", bbox: [620121.7473787402, 6015161.046564645, 625244.6191419007, 6019185.462484817], geometry: {type: "Point", coordinates: [622907.08264, 6017783.24574]}, properties: {text: "23758 Oldenburg in Holstein", typ: "Ort", score: 1.8631368, bbox: {type: "Polygon", coordinates: [[[620223.5644, 6015161.04656], [620121.74738, 6019051.39066], [625138.54766, 6019185.46248], [625244.61914, 6015295.17322], [620223.5644, 6015161.04656]]]}, ags: "01055033", rs: "010550033033", schluessel: "0105500330330000", bundesland: "Schleswig-Holstein", regbezirk: "", kreis: "Ostholstein", verwgem: "Oldenburg in Holstein", gemeinde: "Oldenburg in Holstein", plz: "23758", ort: "Oldenburg in Holstein", ortsteil: ""}, id: "DEGAC00000014045"}, {type: "Feature", bbox: [446017.03968711296, 5888380.894664277, 446303.0690417402, 5888993.880392346], geometry: {type: "Point", coordinates: [446135.99305, 5888681.63823]}, properties: {text: "26121 Oldenburg(Oldb) - Wechloy", typ: "Ort", score: 1.8527052, bbox: {type: "Polygon", coordinates: [[[446017.03969, 5888384.03331], [446023.91356, 5888993.88039], [446303.06904, 5888990.74192], [446296.23072, 5888380.89466], [446017.03969, 5888384.03331]]]}, ags: "03403000", rs: "034030000000", schluessel: "0340300000000000", bundesland: "Niedersachsen", regbezirk: "Weser-Ems", kreis: "Oldenburg(Oldb), Kreisfreie Stadt", verwgem: "Oldenburg (Oldb)", gemeinde: "Oldenburg (Oldenb.), Stadt", plz: "26121", ort: "Oldenburg(Oldb)", ortsteil: "Wechloy"}, id: "DEGAC00000016044"}, {type: "Feature", bbox: [445895.8696565448, 5888070.613774485, 446332.14663459844, 5888522.418367459], geometry: {type: "Point", coordinates: [446029.27005, 5888231.50423]}, properties: {text: "26122 Oldenburg(Oldb) - Wechloy", typ: "Ort", score: 1.8527052, bbox: {type: "Polygon", coordinates: [[[445895.86966, 5888075.46564], [445900.91822, 5888522.41837], [446332.14663, 5888517.5667], [446327.13831, 5888070.61377], [445895.86966, 5888075.46564]]]}, ags: "03403000", rs: "034030000000", schluessel: "0340300000000000", bundesland: "Niedersachsen", regbezirk: "Weser-Ems", kreis: "Oldenburg(Oldb), Kreisfreie Stadt", verwgem: "Oldenburg (Oldb)", gemeinde: "Oldenburg (Oldenb.), Stadt", plz: "26122", ort: "Oldenburg(Oldb)", ortsteil: "Wechloy"}, id: "DEGAC00000016047"}, {type: "Feature", bbox: [447688.190718467, 5889155.2191831535, 448630.31459471956, 5890726.370237521], geometry: {type: "Point", coordinates: [448168.19605, 5889935.83022]}, properties: {text: "26123 Oldenburg(Oldb) - Nadorst", typ: "Ort", score: 1.8527052, bbox: {type: "Polygon", coordinates: [[[447688.19072, 5889165.23937], [447705.24757, 5890726.37024], [448630.31459, 5890716.35148], [448613.5595, 5889155.21918], [447688.19072, 5889165.23937]]]}, ags: "03403000", rs: "034030000000", schluessel: "0340300000000000", bundesland: "Niedersachsen", regbezirk: "Weser-Ems", kreis: "Oldenburg(Oldb), Kreisfreie Stadt", verwgem: "Oldenburg (Oldb)", gemeinde: "Oldenburg (Oldenb.), Stadt", plz: "26123", ort: "Oldenburg(Oldb)", ortsteil: "Nadorst"}, id: "DEGAC00000016050"}]};

    beforeEach(() => {
        fetch.resetMocks();
        fetch.mockResponseOnce(JSON.stringify(searchResult));
    });

    it("should init OSGTS", () => {
        expect(OSGTS).toBeDefined();

        const osgts = new OSGTS(options);

        expect(osgts).toBeDefined();
    });

    it("should request search results with given parameters", async () => {
        const osgts = new OSGTS(options),
            result = await osgts.search("Oldenburg");

        expect(fetch).toBeCalledWith("https://search?outputformat=json&srsName=epsg:25832&query=Oldenburg&count=5");

        expect(result).toEqual(searchResult);
    });

    it("should request search results with additional bbox", async () => {
        const osgts = new OSGTS(Object.assign({}, options, {extent: [123, 321, 124, 322]})),
            result = await osgts.search("Oldenburg");

        expect(fetch).toBeCalledWith("https://search?outputformat=json&bbox=123,321,124,322&srsName=epsg:25832&query=Oldenburg&count=5");

        expect(result).toEqual(searchResult);
    });
});