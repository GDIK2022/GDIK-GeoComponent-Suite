import {Control} from "ol/control";
export default class LayerswitcherControl extends Control {

    constructor (olLayers) {
        const div = document.createElement("div");

        div.className = "ol-control gdik-layerswitcher";

        super({element: div});

        this.olLayers = olLayers;
        this.layerContainer = document.createElement("ul");
        this.olLayers.forEach((layer) => {
            const li = document.createElement("li"),
                input = document.createElement("input"),
                label = document.createElement("label"),
                elementId = "bg-layer-" + layer.get("id");

            input.id = elementId;
            input.name = "bg-layer";
            input.type = "radio";
            input.checked = layer.getVisible();
            li.appendChild(input);

            label.for = elementId;
            label.innerHTML = layer.get("name");
            li.appendChild(label);

            this.layerContainer.appendChild(li);
        });

        div.appendChild(this.layerContainer);
    }
}