import {Control} from "ol/control";
import Select from "ol/interaction/Select.js";
import {click} from "ol/events/condition.js";
import GeoJSON from "ol/format/GeoJSON";

const format = new GeoJSON();

export default class SelectControl extends Control {
    constructor (layerManager, styleManager, options, i18next) {

        const div = document.createElement("div"),
            clearSelectionBtn = document.createElement("button");

        div.className = "ol-control gcs-delete";

        clearSelectionBtn.innerHTML = "&#x1F5D1;";
        clearSelectionBtn.disabled = true;
        clearSelectionBtn.title = i18next.t("CLEAR_SELECTION", {ns: "select"});

        div.appendChild(clearSelectionBtn);

        super({element: div});

        if (!layerManager?.interactionLayer) {
            throw Error("Interaction layer is undefined");
        }

        this.featureLayer = layerManager.interactionLayer;

        this.featureLayer.set("type", "Select");
        this.featureLayer.set("name", "Internal InteractionLayer");

        if (styleManager?.getInteractionLayerStyleId()) {
            this.featureLayer.set("styleId", styleManager.getInteractionLayerStyleId());
            styleManager.addStyleToLayer(this.featureLayer);
        }
        if (styleManager?.getInteractionLayerHighlightStyleId()) {
            options.style = styleManager.getStyleFunctionFromStyleId(styleManager.getInteractionLayerHighlightStyleId());
        }

        options.layers = [this.featureLayer];
        options.condition = click;
        options.multi = false;

        this.selectInteraction = new Select(options);
        this.selectInteraction.setActive(true);

        this.selectInteraction.on("select", this.handleSelectFeature.bind(this));

        clearSelectionBtn.onclick = this.handleClearDrawBtnClick.bind(this);

        i18next.on("languageChanged", this.handleLanguageChange.bind(this));

        this.clearSelectionBtn = clearSelectionBtn;
        this.i18next = i18next;

        layerManager.interactionLayer.setVisible(true);
    }

    setMap (map) {
        super.setMap(map);
        map.addInteraction(this.selectInteraction);
    }

    handleLanguageChange () {
        this.clearSelectionBtn.title = this.i18next.t("CLEAR_SELECTION", {ns: "select"});
    }

    handleSelectFeature () {
        if (this.selectInteraction.getFeatures().getLength() === 0) {
            this.clearSelectionBtn.disabled = true;
            this.dispatchEvent("deselectfeature");
        }
        else {
            this.clearSelectionBtn.disabled = false;
            this.dispatchEvent("selectfeature");
        }
    }

    handleClearDrawBtnClick () {
        this.selectInteraction.getFeatures().clear();
        this.dispatchEvent("deselectfeature");
    }

    getSelectedFeatures () {
        return this.selectInteraction.getFeatures().getLength() === 0 ? undefined : format.writeFeatures(this.selectInteraction.getFeatures().getArray());
    }

}
