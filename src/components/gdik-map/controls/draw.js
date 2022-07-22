import {Control} from "ol/control";
import Draw from "ol/interaction/Draw";
import Modify from "ol/interaction/Modify";
import GeoJSON from "ol/format/GeoJSON";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";

const DRAW_TYPES = ["Point", "LineString", "Polygon"];

export default class DrawControl extends Control {

    /**

        feature added -> disable draw -> enable edit, enable remove (changefeature, removefeature listener)
        feature removed -> disable edit, disable remove -> enable draw (addfeature listerner)

     */

    constructor (options) {
        const div = document.createElement("div"),
            clearDrawBtn = document.createElement("button");

        div.className = "ol-control gdik-delete";

        clearDrawBtn.innerHTML = "&#x1F5D1;";
        clearDrawBtn.disabled = true;

        div.appendChild(clearDrawBtn);

        super({element: div});

        this.featureSource = new VectorSource();
        this.featureLayer = new VectorLayer({source: this.featureSource});

        if (!options?.drawType) {
            throw Error("Missing draw type");
        }

        if (DRAW_TYPES.filter(t => t === options.drawType).length !== 1) {
            throw Error(`Unsupported draw type "${options.drawType}"`);
        }

        this.drawInteraction = new Draw({
            type: options.drawType,
            source: this.featureSource
        });

        this.modifyInteraction = new Modify({
            source: this.featureSource
        });

        this.featureSource.on("addfeature", this.handleAddFeature.bind(this));
        this.modifyInteraction.on("modifyend", this.handleChangeFeature.bind(this));

        clearDrawBtn.onclick = this.handleRemoveFeature.bind(this);

        this.clearDrawBtn = clearDrawBtn;
    }

    setMap (map) {
        super.setMap(map);
        map.addInteraction(this.drawInteraction);
        this.drawInteraction.setActive(true);
        map.addInteraction(this.modifyInteraction);
        this.modifyInteraction.setActive(false);
        map.addLayer(this.featureLayer);
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
        this.featureSource.clear();
        this.clearDrawBtn.disabled = true;
        this.modifyInteraction.setActive(false);
        this.drawInteraction.setActive(true);
        this.dispatchEvent("featureupdate");
    }

    toggleDraw () {
        // TODO
    }

    getFeatureCollection () {
        return new GeoJSON().writeFeatures(this.featureSource.getFeatures());
    }

}