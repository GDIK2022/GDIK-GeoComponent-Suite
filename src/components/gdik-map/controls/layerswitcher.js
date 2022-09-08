import {Control} from "ol/control";
export default class LayerswitcherControl extends Control {

    constructor (layerManager) {
        const div = document.createElement("div");

        div.className = "ol-control gdik-layerswitcher";

        super({element: div});

        this.layerManager = layerManager;

        this.layerContainer = document.createElement("ul");
        this.layerContainer.className = "list-group";

        div.appendChild(this.layerContainer);
    }

    setMap (map) {
        this.render();
        super.setMap(map);
    }

    render () {
        this.layerContainer.querySelectorAll("*").forEach(n => n.remove());

        this.layerManager.olBackgroundLayer.forEach((layer) => {
            const li = document.createElement("li");

            li.className = "list-group-item";
            li.className += layer.getVisible() ? " active" : "";

            li.addEventListener("click", this.handleBackgroundLayerChange.bind(this, layer.get("id")));
            li.innerHTML = layer.get("name");

            this.layerContainer.appendChild(li);
        });

    }

    handleBackgroundLayerChange (id) {
        return this.layerManager.changeBackgroundLayer(id)
            .then(this.render.bind(this));
    }
}