import {Control} from "ol/control";

export default class LayerswitcherControl extends Control {

    constructor (layerManager) {
        const containerDiv = document.createElement("div"),
            open = document.createElement("div"),
            closed = document.createElement("button"),
            closer = document.createElement("button");

        containerDiv.className = "ol-control gcs-layerswitcher";
        super({element: containerDiv});

        closed.className = "";
        closed.innerHTML = "&#x3E;";
        closed.addEventListener("click", () => {
            open.classList.remove("hidden");
            closed.classList.add("hidden");
        });

        open.className = "list-container hidden";

        this.layerManager = layerManager;

        this.layerContainer = document.createElement("ul");
        this.layerContainer.className = "list-group";

        open.appendChild(this.layerContainer);

        closer.className = "closer";
        closer.innerHTML = "&#x3C;";
        closer.addEventListener("click", () => {
            closed.classList.remove("hidden");
            open.classList.add("hidden");
        });

        open.appendChild(closer);

        containerDiv.appendChild(closed);
        containerDiv.appendChild(open);
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