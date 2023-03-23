import DrawControl from "./drawControl";

export default class GCSDraw extends HTMLElement {


    static get observedAttributes () {
        return ["feature"];
    }

    constructor () {
        super();
        this.control = null;
    }

    registerGCSMap (map, layerManager) {
        this.control = new DrawControl(layerManager, {
            drawType: this.getAttribute("draw-type")
        });

        if (this.hasAttribute("feature")) {
            this.control.setFeatureCollection(this.getAttribute("feature"));
        }

        this.control.on("featureupdate", () => {
            const fc = this.control.getFeatureCollection();

            if (fc === undefined) {
                this.setAttribute("feature", "");
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

customElements.define("gcs-draw", GCSDraw);