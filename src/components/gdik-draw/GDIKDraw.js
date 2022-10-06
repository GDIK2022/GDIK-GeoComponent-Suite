import {DrawControl} from "./drawControl";

export default class GDIKDraw extends HTMLElement {
    constructor () {
        super();
        this.control = null;
    }

    registerGDIKMap (map, layerManager) {
        let featureCollection;

        if (this.hasAttribute("feature")) {
            featureCollection = JSON.parse(this.getAttribute("feature"));
        }

        this.control = new DrawControl(layerManager, {
            featureCollection: featureCollection,
            drawType: this.getAttribute("draw-type")
        });

        this.control.on("featureupdate", () => {
            const fc = this.control.getFeatureCollection();

            if (fc === undefined) {
                this.removeAttribute("feature");
                return;
            }
            this.setAttribute("feature", fc);
        });

        map.addControl(this.control);
    }
}

customElements.define("gdik-draw", GDIKDraw);