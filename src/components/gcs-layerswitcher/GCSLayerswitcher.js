import LayerswitcherControl from "./layerswitcherControl";

export default class GCSLayerSwitcher extends HTMLElement {

    constructor () {
        super();
        this.control = null;
    }

    registerGCSMap (map, layerManager) {
        this.control = new LayerswitcherControl(layerManager);
        map.addControl(this.control);
    }
}

customElements.define("gcs-layerswitcher", GCSLayerSwitcher);