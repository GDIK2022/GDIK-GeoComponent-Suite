
import {getLayerWhere} from "masterportalAPI/src/rawLayerList";

export default class LayerManager {

    constructor (map, backgroundLayers) {
        this.map = map;
        this.backgroundLayerIds = [];
        this.olBackgroundLayer = [];
        this.activeBackgroundLayer = null;

        backgroundLayers.forEach(layerId => {
            const rawLayer = getLayerWhere({id: layerId});
            let layer = null;

            if (!rawLayer) {
                console.error("Background layer with id '" + layerId + "' not found. Skipped.");
                return;
            }

            layer = map.addLayer(layerId);
            layer.set("name", rawLayer.name);
            this.olBackgroundLayer.push(layer);
            this.backgroundLayerIds.push(layerId);

            if (this.activeBackgroundLayer === null) {
                this.activeBackgroundLayer = layer;
            }

            layer.setVisible(layer === this.activeBackgroundLayer);
        });
    }

    changeBackgroundLayer (id) {
        if (!this.backgroundLayerIds.includes(id)) {
            console.error(`Background layer with id ${id} not found`);
            return;
        }

        const newBackgroundLayer = this.olBackgroundLayer.filter(l => l.get("id") === id)[0];

        if (this.activeBackgroundLayer) {
            this.activeBackgroundLayer.setVisible(false);
        }
        newBackgroundLayer.setVisible(true);
        this.activeBackgroundLayer = newBackgroundLayer;
    }

}