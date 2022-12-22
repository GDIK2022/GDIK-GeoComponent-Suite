import SearchControl from "./searchControl";

export default class GDIKSearch extends HTMLElement {

    constructor () {
        super();
        this.control = null;
    }

    async connectedCallback () {
        this.searchUrl = this.getAttribute("search-url");
    }

    registerGDIKMap (map) {
        this.control = new SearchControl({
            searchUrl: this.searchUrl
        });
        map.addControl(this.control);
    }
}

customElements.define("gdik-search", GDIKSearch);