import {Control} from "ol/control";
export default class LayerswitcherControl extends Control {

    constructor (options) {
        const div = document.createElement("div");

        div.className = "ol-control gdik-layerswitcher";

        super({element: div});

        this.backgroundLayers = options.backgroundLayers;
        this.layerContainer = document.createElement("ul");
        div.appendChild(this.layerContainer);
    }

    setMap (map) {
        const olLayers = map.getLayers().getArray()
            .filter((layer) => {
                return this.backgroundLayers.indexOf(layer.get("id")) !== -1;
            });

        super.setMap(map);

        olLayers.forEach((layer) => {
            const li = document.createElement("li");

            li.innerHTML = layer.get("name");
            this.layerContainer.appendChild(li);
        });
    }
}