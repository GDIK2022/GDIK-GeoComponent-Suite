import {Control} from "ol/control";
import Draw from "ol/interaction/Draw";
import Modify from "ol/interaction/Modify";
import GeoJSON from "ol/format/GeoJSON";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";

const DRAW_TYPES = ["Point", "LineString", "Polygon"],
    format = new GeoJSON();

export default class DrawControl extends Control {

    /**

        feature added -> disable draw -> enable edit, enable remove (changefeature, removefeature listener)
        feature removed -> disable edit, disable remove -> enable draw (addfeature listerner)

     */

    constructor(layerManager, styleManager, options, i18next) {
        const div = document.createElement("div"),
            clearDrawBtn = document.createElement("button"),
            drawOptions = {};

        div.className = "ol-control gcs-delete";

        clearDrawBtn.innerHTML = "&#x1F5D1;";
        clearDrawBtn.disabled = true;
        clearDrawBtn.title = i18next.t("ERASE_DRAW", {ns: "draw"});

        div.appendChild(clearDrawBtn);

        super({element: div});

        if (!options?.drawType) {
            throw Error("Missing draw type");
        }
        this.drawType = options.drawType;

        if (DRAW_TYPES.filter(t => t === options.drawType).length !== 1) {
            throw Error(`Unsupported draw type "${options.drawType}"`);
        }

        this.featureSource = new VectorSource();
        this.featureLayer = new VectorLayer({source: this.featureSource});

        drawOptions.type = this.drawType;
        drawOptions.source = this.featureSource;

        this.featureLayer.set("type", "Draw");
        this.featureLayer.set("name", "Internal InteractionLayer");

        if (styleManager && styleManager.getInteractionLayerStyleId()) {
            this.featureLayer.set("styleId", styleManager.getInteractionLayerStyleId());
            styleManager.addStyleToLayer(this.featureLayer);
            drawOptions.style = this.featureLayer.getStyle();
        }

        layerManager.setInteractionLayer(this.featureLayer);

        this.drawInteraction = new Draw(drawOptions);
        this.drawInteraction.setActive(true);

        this.modifyInteraction = new Modify({
            source: this.featureSource
        });
        this.modifyInteraction.setActive(false);

        this.featureSource.on("addfeature", this.handleAddFeature.bind(this));
        this.featureSource.on("removefeature", this.handleRemoveFeature.bind(this));
        this.modifyInteraction.on("modifyend", this.handleChangeFeature.bind(this));

        clearDrawBtn.onclick = this.handleClearDrawBtnClick.bind(this);

        i18next.on("languageChanged", this.handleLanguageChange.bind(this));

        this.clearDrawBtn = clearDrawBtn;
        this.i18next = i18next;
    }

    setMap (map) {
        super.setMap(map);
        map.addInteraction(this.drawInteraction);
        map.addInteraction(this.modifyInteraction);
    }

    handleLanguageChange () {
        this.clearDrawBtn.title = this.i18next.t("ERASE_DRAW", {ns: "draw"});
    }

    handleAddFeature () {
        this.drawInteraction.setActive(false);
        this.modifyInteraction.setActive(true);
        this.clearDrawBtn.disabled = false;
        this.dispatchEvent("featureupdate");
    }

    handleChangeFeature () {
        this.dispatchEvent("featureupdate");
    }

    handleRemoveFeature () {
        this.clearDrawBtn.disabled = true;
        this.modifyInteraction.setActive(false);
        this.drawInteraction.setActive(true);
        this.dispatchEvent("featureupdate");
    }

    handleClearDrawBtnClick () {
        this.featureSource.clear(true);
        this.featureSource.dispatchEvent("removefeature");
    }

    getFeatureCollection () {
        return this.featureSource.getFeatures().length === 0 ? undefined : format.writeFeatures(this.featureSource.getFeatures());
    }

    setFeatureCollection (featureCollection) {
        let features;

        try {
            features = format.readFeatures(featureCollection);
        }
        catch (e) {
            return;
        }
        if (this.drawType !== this.determineDrawType(features)) {
            throw Error("Geometry type of given feature collection mismatch draw-type");
        }

        this.featureSource.clear(true);
        this.featureSource.addFeatures(features);
    }

    determineDrawType (features) {
        let drawType;

        features.forEach((f) => {
            const featureType = f.getGeometry().getType();

            if (drawType !== undefined && drawType !== featureType) {
                throw Error("Inhomogeneous feature collection given");
            }
            drawType = featureType;
        });
        return drawType;
    }

}
