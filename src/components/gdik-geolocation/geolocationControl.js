import {Control} from "ol/control";

export default class GeolocationControl extends Control {

    constructor () {
        const containerDiv = document.createElement("div"),
            button = document.createElement("button");

        containerDiv.appendChild(button);
        containerDiv.className = "ol-control gdik-geolocation";
        super({element: containerDiv});

    }

    setMap (map) {
        super.setMap(map);
    }
}
