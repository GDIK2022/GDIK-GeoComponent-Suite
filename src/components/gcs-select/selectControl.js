import {Control} from "ol/control";
import Select from 'ol/interaction/Select.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';

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

        this.featureSource = new VectorSource();
        this.featureLayer = new VectorLayer({source: this.featureSource});

        this.featureLayer.set("type", "Select");
        this.featureLayer.set("name", "Internal InteractionLayer");

        if (styleManager?.getInteractionLayerStyleId()) {
            this.featureLayer.set("styleId", styleManager.getInteractionLayerStyleId());
            styleManager.addStyleToLayer(this.featureLayer);
            options.style = this.featureLayer.getStyle();
        }

        layerManager.setInteractionLayer(this.featureLayer);

        this.selectInteraction = new Select(options);
        this.selectInteraction.setActive();

        this.modifyInteraction.on("select", this.handleSelectFeature.bind(this));

        clearDrawBtn.onclick = this.handleClearDrawBtnClick.bind(this);

        i18next.on("languageChanged", this.handleLanguageChange.bind(this));

        this.clearDrawBtn = clearDrawBtn;
        this.i18next = i18next;
    }

    setMap (map) {
        super.setMap(map);
        map.addInteraction(this.selectInteraction);
    }

    handleLanguageChange () {
        this.clearDrawBtn.title = this.i18next.t("ERASE_DRAW", {ns: "draw"});
    }

    handleChangeFeature () {
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
