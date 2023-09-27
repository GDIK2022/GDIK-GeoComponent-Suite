import SelectControl from "./selectControl";

export default class GCSSelect extends HTMLElement {


    static get observedAttributes () {
        return ["value"];
    }

    constructor () {
        super();
        this.control = null;
    }

    registerGCSMap (map, layerManager, i18next, styleManager) {
        i18next.addResources("en", "draw", {ERASE_DRAW: "Clear selection"});
        i18next.addResources("de", "draw", {ERASE_DRAW: "Auswahl aufheben"});

        this.control = new SelectControl(layerManager, styleManager, {}, i18next);

        this.control.on("selectfeature", () => {
            const fc = this.control.getSelectedFeatures();

            if (fc === undefined) {
                this.setAttribute("value", "");
                return;
            }
            this.setAttribute("value", fc);
        });

        this.control.on("deselectfeature", () => {
            this.setAttribute("value", "");
        });

        map.addControl(this.control);
    }

}

customElements.define("gcs-select", GCSSelect);
