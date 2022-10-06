import LayerswitcherControl from "./layerswitcherControl";

export default class GDIKLayerSwitcher extends HTMLElement {

    constructor () {
        super();
        this.control = null;
    }

    registerGDIKMap (map, layerManager) {
        this.control = new LayerswitcherControl(layerManager);
        map.addControl(this.control);
    }
}

customElements.define("gdik-layerswitcher", GDIKLayerSwitcher);