import {Control} from "ol/control";
import OSGTS from "./type/osgts.js";

export default class SearchControl extends Control {

    constructor (options) {
        const containerDiv = document.createElement("div");

        containerDiv.className = "ol-control gdik-search";
        super({element: containerDiv});

        this.searchUrl = options.searchUrl;
        this.suggestUrl = options.suggestUrl;

        this.input = document.createElement("input");
        this.input.onkeydown = this.handleSearch.bind(this);
        containerDiv.appendChild(this.input);

        this.resultsContainer = document.createElement("div");
        this.resultsContainer.className = "gdik-search-results";
        containerDiv.appendChild(this.resultsContainer);
    }

    setMap (map) {
        this.view = map.getView();
        this.search = new OSGTS({
            searchUrl: this.searchUrl,
            suggestUrl: this.suggestUrl,
            srs: map.getView().getProjection().getCode()
        });
        super.setMap(map);
    }

    handleSearch (e) {
        const elem = e.srcElement || e.target;

        if (e.keyCode === 13) {
            e.preventDefault();
            this.clearResults();
            this.search.search(elem.value).then((resp) => this.renderResponse(resp));
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

