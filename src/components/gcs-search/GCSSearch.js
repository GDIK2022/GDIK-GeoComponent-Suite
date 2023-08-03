import SearchControl from "./searchControl";

export default class GCSSearch extends HTMLElement {

    static get observedAttributes () {
        return ["search-string"];
    }

    constructor () {
        super();
        this.control = null;
    }

    async connectedCallback () {
        this.searchUrl = this.getAttribute("search-url");
        this.searchString = this.getAttribute("search-string");
    }

    registerGCSMap (map) {
        this.control = new SearchControl({
            searchUrl: this.searchUrl,
            searchString: this.searchString
        });
        map.addControl(this.control);
    }

    // Web Component Callback
    attributeChangedCallback (name, oldValue, newValue) {
        if (oldValue === null) {
            return;
        }
        if (oldValue === newValue) {
            return;
        }
        if (this.control === null) {
            return;
        }
        switch (name) {
            case "search-string":
                this.control.set("searchString", newValue);
                this.searchString = newValue;
                break;
            default:
                break;
        }
    }

}

customElements.define("gcs-search", GCSSearch);