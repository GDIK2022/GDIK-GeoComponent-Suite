import {Control} from "ol/control";
import Select from 'ol/interaction/Select.js';
import {click} from 'ol/events/condition.js';

export default class SelectControl extends Control {
    constructor (layerManager, styleManager, options, i18next) {

        const div = document.createElement("div"),
            clearDrawBtn = document.createElement("button");

        div.className = "ol-control gcs-delete";

        clearDrawBtn.innerHTML = "&#x1F5D1;";
        clearDrawBtn.disabled = true;
        clearDrawBtn.title = i18next.t("ERASE_DRAW", {ns: "draw"});

        div.appendChild(clearDrawBtn);

        super({element: div});

        this.featureLayer = layerManager.interactionLayer;

        this.featureLayer.set("type", "Select");
        this.featureLayer.set("name", "Internal InteractionLayer");

        if (styleManager?.getInteractionLayerStyleId()) {
            this.featureLayer.set("styleId", styleManager.getInteractionLayerStyleId());
            styleManager.addStyleToLayer(this.featureLayer);
            options.style = this.featureLayer.getStyle();
        }

        options.layers = [this.featureLayer];
        options.condition = click;

        console.log(options);

        this.selectInteraction = new Select(options);
        this.selectInteraction.setActive();

        this.selectInteraction.on("select", this.handleSelectFeature.bind(this));

        layerManager.map.addInteraction(this.selectInteraction);

        clearDrawBtn.onclick = this.handleClearDrawBtnClick.bind(this);

        i18next.on("languageChanged", this.handleLanguageChange.bind(this));

        this.clearDrawBtn = clearDrawBtn;
        this.i18next = i18next;

        console.log(layerManager.map.getInteractions());
        console.log(layerManager.interactionLayer);
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
        console.log("handleSelectFeature");
        this.dispatchEvent("selectfeature");
    }

    handleClearDrawBtnClick () {
        this.selectInteraction.getFeatures().clear();
        this.featureSource.dispatchEvent("deselectfeature");
    }

    getSelectedFeature () {
        return this.selectInteraction.getFeatures();
    }

}
