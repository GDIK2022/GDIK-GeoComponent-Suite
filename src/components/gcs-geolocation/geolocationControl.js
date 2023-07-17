import {Control} from "ol/control";
import Geolocation from "ol/Geolocation";

export default class GeolocationControl extends Control {

    constructor (i18next) {
        const containerDiv = document.createElement("div"),
            button = document.createElement("button");

        button.innerHTML = "&#x2316;";
        button.title = i18next.t("GEOLOCATE", {ns: "geolocate"});

        containerDiv.appendChild(button);
        containerDiv.className = "ol-control gcs-geolocation";
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