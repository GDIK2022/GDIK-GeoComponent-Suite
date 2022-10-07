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

    constructor (layerManager, options) {
        const div = document.createElement("div"),
            clearDrawBtn = document.createElement("button");

        let features;

        div.className = "ol-control gdik-delete";

        clearDrawBtn.innerHTML = "&#x1F5D1;";
        clearDrawBtn.disabled = true;

        div.appendChild(clearDrawBtn);

        super({element: div});

        if (options?.featureCollection) {
            features = format.readFeatures(options.featureCollection);
            options.drawType = this.determineDrawType(features) || options.drawType;
        }

        if (!options?.drawType) {
            throw Error("Missing draw type");
        }

        if (DRAW_TYPES.filter(t => t === options.drawType).length !== 1) {
            throw Error(`Unsupported draw type "${options.drawType}"`);
        }

        this.featureSource = new VectorSource({features: features});
        this.featureLayer = new VectorLayer({source: this.featureSource});

        layerManager.addLayerOnTop(this.featureLayer);

        this.drawInteraction = new Draw({
            type: options.drawType,
            source: this.featureSource
        });
        this.drawInteraction.setActive(true);

        this.modifyInteraction = new Modify({
            source: this.featureSource
        });
        this.modifyInteraction.setActive(false);

        this.featureSource.on("addfeature", this.handleAddFeature.bind(this));
        this.featureSource.on("removefeature", this.handleRemoveFeature.bind(this));
        this.modifyInteraction.on("modifyend", this.handleChangeFeature.bind(this));

        clearDrawBtn.onclick = this.handleClearDrawBtnClick.bind(this);

        this.clearDrawBtn = clearDrawBtn;

        if (features !== undefined && features.length > 0) {
            this.handleAddFeature();
        }
    }

    setMap (map) {
        super.setMap(map);
        map.addInteraction(this.drawInteraction);
        map.addInteraction(this.modifyInteraction);
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