import SearchControl from "./searchControl";

export default class GCSSearch extends HTMLElement {

    constructor () {
        super();
        this.control = null;
    }

    async connectedCallback () {
        this.searchUrl = this.getAttribute("search-url");
    }

    registerGCSMap (map) {
        this.control = new SearchControl({
            searchUrl: this.searchUrl
        });
        map.addControl(this.control);
    }
}

customElements.define("gcs-search", GCSSearch);