import {Control} from "ol/control";
import OSGTS from "./type/osgts.js";

export default class SearchControl extends Control {

    constructor (options) {
        const containerDiv = document.createElement("div");

        containerDiv.className = "ol-control gcs-search";
        super({element: containerDiv});

        this.searchUrl = options.searchUrl;

        this.input = document.createElement("input");
        this.on("propertychange", this.handlePropertyChange.bind(this));
        this.searchString = options.searchString || "";
        this.input.value = this.searchString;
        this.input.onkeydown = this.handleSearch.bind(this);
        containerDiv.appendChild(this.input);

        this.resultsContainer = document.createElement("div");
        this.resultsContainer.className = "gcs-search-results";
        containerDiv.appendChild(this.resultsContainer);
    }

    setMap (map) {
        this.view = map.getView();
        this.searchEngine = new OSGTS({
            searchUrl: this.searchUrl,
            srs: map.getView().getProjection().getCode()
        });
        if (this.searchString) {
            this.search(this.searchString).then((resp) => {
                const text = resp.features[0].properties.text,
                    coords = resp.features[0].geometry.coordinates;

                this.showResult(text, coords);
            }).catch((err) => this.handleSearchError(err));
        }
        super.setMap(map);
    }

    handleSearch (e) {
        const elem = e.srcElement || e.target;

        if (e.keyCode === 13) {
            e.preventDefault();
            e.stopPropagation();
            this.search(elem.value).catch((err) => this.handleSearchError(err));
        }
    }

    async search (string) {
        this.clearResults();
        if (this.searchEngine === undefined) {
            return new Promise((resolve, reject) => {
                reject();
            });
        }

        return this.searchEngine.search(string).then((resp) => {
            this.renderResponse(resp);
            return resp;
        });
    }

    // eslint-disable-next-line no-unused-vars, handle-callback-err
    handleSearchError (err) {
        // TODO implement
    }

    handlePropertyChange (property) {
        if (property.key === "searchString") {
            this.input.value = this.get("searchString");
            this.search(this.input.value).catch((err) => this.handleSearchError(err));
        }
    }

    renderResponse (findings) {
        findings.features.forEach((feature) => {
            const elem = document.createElement("div");

            elem.innerHTML = feature.properties.text;
            elem.onclick = this.showResult.bind(this, feature.properties.text, feature.geometry.coordinates);
            this.resultsContainer.appendChild(elem);
        });
    }

    showResult (text, coords) {
        this.input.value = text;
        this.view.setCenter(coords);
        this.clearResults();
    }

    clearResults () {
        this.resultsContainer.innerHTML = "";
    }
}
