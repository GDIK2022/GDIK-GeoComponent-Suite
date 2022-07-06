import {Control} from "ol/control";
import Draw from "ol/interaction/Draw";
import Modify from "ol/interaction/Modify";
import GeoJSON from "ol/format/GeoJSON";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";

const DRAW_TYPES = ["Point", "Line", "Polygon"];

export default class DrawControl extends Control {

    constructor (options) {
        const ul = document.createElement("ul"),
            li = document.createElement("li"),
            div = document.createElement("div"),
            button = document.createElement("button");

        ul.className = "controls";

        button.className = "control-icon";
        button.innerHTML = options.drawType;

        div.appendChild(button);
        li.appendChild(div);
        ul.appendChild(li);

        super({element: ul});

        this.featureSource = new VectorSource();
        this.featureLayer = new VectorLayer({source: this.featureSource});

        if (options.drawType === null) {
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

        button.onclick = this.toggleDraw;
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
        this.dispatchEvent("featureupdate");
    }

    handleChangeFeature () {
        this.dispatchEvent("featureupdate");
    }

    toggleDraw () {
        // TODO
    }

    getFeatureCollection () {
        return new GeoJSON().writeFeatures(this.featureSource.getFeatures());
    }

}