import LayerswitcherControl from "./layerswitcherControl";

export default class GCSLayerSwitcher extends HTMLElement {

    constructor () {
        super();
        this.control = null;
    }

    registerGCSMap (map, layerManager, i18next) {
        i18next.addResources("en", "layerswitcher", {OPEN: "Show layerswitcher", CLOSE: "Hide layerswitcher"});
        i18next.addResources("de", "layerswitcher", {OPEN: "Ebenenauswahl anzeigen", CLOSE: "Ebenenauswahl verbergen"});

        this.control = new LayerswitcherControl(layerManager, i18next);
        map.addControl(this.control);
    }
}

customElements.define("gcs-layerswitcher", GCSLayerSwitcher);