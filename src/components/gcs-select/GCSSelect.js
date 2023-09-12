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
        i18next.addResources("en", "draw", {ERASE_DRAW: "Erase geometry"});
        i18next.addResources("de", "draw", {ERASE_DRAW: "Geometrie löschen"});

        this.control = new SelectControl(layerManager, styleManager, {}, i18next);

        this.control.on("selectfeature", () => {
            const fc = this.control.getSelectedFeature();

            if (fc === undefined || fc.getLength() <= 0) {
                this.setAttribute("value", "");
                return;
            }
            this.setAttribute("value", fc);
        });

        map.addControl(this.control);
    }

}

customElements.define("gcs-select", GCSSelect);
