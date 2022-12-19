import SearchControl from "./searchControl";

export default class GDIKSearch extends HTMLElement {

    constructor () {
        super();
        this.control = null;
    }

    registerGDIKMap (map) {
        this.control = new SearchControl({
            searchUrl: "https://sg.geodatenzentrum.de/gdz_geokodierung__135f930d-3138-16c4-7433-3ea12cfa13d6/geosearch.json",
            suggestUrl: "https://sg.geodatenzentrum.de/gdz_geokodierung__135f930d-3138-16c4-7433-3ea12cfa13d6/suggest.json"
        });
        map.addControl(this.control);
    }
}

customElements.define("gdik-search", GDIKSearch);