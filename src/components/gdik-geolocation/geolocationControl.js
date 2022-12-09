import {Control} from "ol/control";
import Geolocation from "ol/Geolocation";

export default class GeolocationControl extends Control {

    constructor () {
        const containerDiv = document.createElement("div"),
            button = document.createElement("button");

        button.innerHTML = "&#x2316;";

        containerDiv.appendChild(button);
        containerDiv.className = "ol-control gdik-geolocation";
        super({element: containerDiv});

        button.onclick = this.geolocate.bind(this);

    }

    setMap (map) {
        super.setMap(map);
        this.view = map.getView();

        this.geolocation = new Geolocation({
            trackingOptions: {
                enableHighAccuracy: true
            },
            projection: this.view.getProjection()
        });
    }

    geolocate () {
        this.geolocation.setTracking(true);

        this.geolocation.once("change:position", () => {
            this.view.setCenter(this.geolocation.getPosition());
            this.geolocation.setTracking(false);
        });

    }
}