import {Control} from "ol/control";
import OSGTS from "./type/osgts.js";

export default class SearchControl extends Control {

    constructor (options) {
        const containerDiv = document.createElement("div");

        containerDiv.className = "ol-control gcs-search";
        super({element: containerDiv});

        this.searchUrl = options.searchUrl;
        this.fallbackResultResolution = 1.3229159522920524;
        // converted to fallbackResultResolution in set map when defined
        this.fallbackResultZoomLevel = options.fallbackResultZoomLevel;

        this.input = document.createElement("input");
        this.on("propertychange", this.handlePropertyChange.bind(this));
        this.searchString = options.searchString;
        this.input.value = this.searchString;
        this.input.onkeydown = this.handleSearch.bind(this);
        containerDiv.appendChild(this.input);

        this.resultsContainer = document.createElement("div");
        this.resultsContainer.className = "gcs-search-results";
        containerDiv.appendChild(this.resultsContainer);
    }

    setMap (map) {
        this.view = map.getView();
        this.search = new OSGTS({
            searchUrl: this.searchUrl,
            srs: map.getView().getProjection().getCode()
        });
        if (this.fallbackResultZoomLevel !== undefined) {
            this.fallbackResultResolution = this.view.getResolutionForZoom(this.fallbackResultZoomLevel);
        }

        if (this.searchString) {
            this.handleSearch({keyCode: 13, target: this.input, preventDefault: () => {
                // noop
            }, stopPropagation: () => {
                // noop
            }});
        }
        super.setMap(map);
    }

    handleSearch (e) {
        const elem = e.srcElement || e.target;

        if (e.keyCode === 13) {
            e.preventDefault();
            e.stopPropagation();
            this.clearResults();
            if (this.search) {
                this.search.search(elem.value).then((resp) => this.renderResponse(resp));
            }
        }
    }

    handlePropertyChange (property) {
        if (property.key === "searchString") {
            this.input.value = this.get("searchString");
            this.handleSearch({keyCode: 13, target: this.input, preventDefault: () => {
                // noop
            }, stopPropagation: () => {
                // noop
            }});
        }
    }

    renderResponse (findings) {
        findings.features.forEach((feature) => {
            const elem = document.createElement("div");

            elem.innerHTML = feature.properties.text;

            elem.onclick = this.showResult.bind(this, feature.properties.text, feature.geometry.coordinates, feature.bbox);
            this.resultsContainer.appendChild(elem);
        });
    }

    showResult (text, coords, bbox) {
        const zoom = this.view.getZoomForResolution(this.fallbackResultResolution);

        this.input.value = text;

        if (bbox !== undefined) {
            this.view.fit(bbox);
        }
        else {
            this.view.setCenter(coords);
            this.view.setZoom(zoom);
        }
        this.clearResults();
    }

    clearResults () {
        this.resultsContainer.innerHTML = "";
    }
}
