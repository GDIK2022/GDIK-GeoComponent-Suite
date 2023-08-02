import rawLayerList from "masterportalAPI/src/rawLayerList";
import Observable from "ol/Observable";

export default class LayerManager extends Observable {

    constructor (map, backgroundLayerIds, foregroundLayerId = null) {
        super();
        this.map = map;
        this.backgroundLayerIds = [];
        this.backgroundLayers = [];
        this.foregroundLayer = null;
        this.interactionLayer = null;
        this.activeBackgroundLayer = null;

        backgroundLayerIds.forEach(layerId => {
            const rawLayer = rawLayerList.getLayerWhere({id: layerId});
            let layer = null;

            if (!rawLayer) {
                console.error("Background layer with id '" + layerId + "' not found. Skipped.");
                return;
            }

            layer = map.addLayer(layerId);
            layer.set("name", rawLayer.name);
            this.backgroundLayers.push(layer);
            this.backgroundLayerIds.push(layerId);

            if (this.activeBackgroundLayer === null) {
                this.activeBackgroundLayer = layer;
            }

            layer.setVisible(layer === this.activeBackgroundLayer);
        });

        if (foregroundLayerId) {
            const rawLayer = rawLayerList.getLayerWhere({id: foregroundLayerId});
            let layer = null;

            if (!rawLayer) {
                console.error("Foreground layer with id '" + foregroundLayerId + "' not found.");
                return;
            }

            layer = map.addLayer(foregroundLayerId);
            layer.set("name", rawLayer.name);
            this.foregroundLayer = layer;
            this.foregroundLayer.setVisible(true);
            this.foregroundLayer.setOpacity(0.5);
        }
    }

    changeBackgroundLayer (id) {
        if (!this.backgroundLayerIds.includes(id)) {
            console.error(`Background layer with id ${id} not found`);
            return Promise.reject(`Background layer with id ${id} not found`);
        }

        const newBackgroundLayer = this.backgroundLayers.filter(l => l.get("id") === id)[0];

        if (this.activeBackgroundLayer) {
            this.activeBackgroundLayer.setVisible(false);
        }
        newBackgroundLayer.setVisible(true);
        this.activeBackgroundLayer = newBackgroundLayer;
        this.dispatchEvent("backgroudchange");
        return Promise.resolve();
    }

    setInteractionLayer (interactionLayer) {
        this.map.removeLayer(this.interactionLayer);
        this.interactionLayer = interactionLayer;
        this.map.addLayer(interactionLayer);
    }

}
