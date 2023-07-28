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
        if (!!this.searchString) {
            this.handleSearch({keyCode: 13, target: this.input, preventDefault: () => {
                // noop
            }});
        }
        super.setMap(map);
    }

    handleSearch (e) {
        const elem = e.srcElement || e.target;

        if (e.keyCode === 13) {
            e.preventDefault();
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
            }});
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
