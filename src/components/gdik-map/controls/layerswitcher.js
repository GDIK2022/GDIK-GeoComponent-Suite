import {Control} from "ol/control";
export default class LayerswitcherControl extends Control {

    constructor (options) {
        const div = document.createElement("div"),
            layerContainer = document.createElement("ul");


        div.className = "ol-control gdik-layerswitcher";

        div.appendChild(layerContainer);

        super({element: div});

        options.backgroundLayers.forEach((lId) => {
            const li = document.createElement("li");

            li.innerHTML = lId;
            layerContainer.appendChild(li);
        });
    }

    setMap (map) {
        super.setMap(map);
    }
}