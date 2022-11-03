import DrawControl from "./drawControl";

export default class GDIKDraw extends HTMLElement {


    static get observedAttributes () {
        return ["feature"];
    }

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
            case "feature":
                if (newValue === null) {
                    this.control.featureSource.clear();
                    return;
                }
                this.control.setFeatureCollection(newValue);
                break;
            default:
                break;
        }
    }
}

customElements.define("gdik-draw", GDIKDraw);