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
        clearSelectionBtn.title = i18next.t("ERASE_DRAW", {ns: "draw"});

        div.appendChild(clearSelectionBtn);

        super({element: div});

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

        this.selectInteraction = new Select(options);
        this.selectInteraction.setActive(true);

        this.selectInteraction.on("select", this.handleSelectFeature.bind(this));

        layerManager.map.addInteraction(this.selectInteraction);

        clearSelectionBtn.onclick = this.handleClearDrawBtnClick.bind(this);

        i18next.on("languageChanged", this.handleLanguageChange.bind(this));

        this.clearDrawBtn = clearSelectionBtn;
        this.i18next = i18next;

        layerManager.interactionLayer.setVisible(true);
    }

    setMap (map) {
        super.setMap(map);
        map.addInteraction(this.selectInteraction);
    }

    handleLanguageChange () {
        this.clearDrawBtn.title = this.i18next.t("ERASE_DRAW", {ns: "draw"});
    }

    handleSelectFeature () {
        this.dispatchEvent("selectfeature");
    }

    handleClearDrawBtnClick () {
        this.selectInteraction.getFeatures().clear();
        this.featureSource.dispatchEvent("deselectfeature");
    }

    getSelectedFeatures () {
        return this.selectInteraction.getFeatures().getLength() === 0 ? undefined : format.writeFeatures(this.selectInteraction.getFeatures().getArray());
    }

}
