import {Control} from "ol/control";
import Geolocation from "ol/Geolocation";

export default class GeolocationControl extends Control {

    constructor (i18next) {
        const containerDiv = document.createElement("div"),
            button = document.createElement("button");

        button.innerHTML = "&#x2316;";
        button.title = i18next.t("GEOLOCATE", {ns: "geolocation"});

        containerDiv.appendChild(button);
        containerDiv.className = "ol-control gcs-geolocation";
        super({element: containerDiv});

        button.onclick = this.geolocate.bind(this);

        i18next.on("languageChanged", this.handleLanguageChange.bind(this));

        this.button = button;
        this.i18next = i18next;
    }

    handleLanguageChange () {
        this.button.title = this.i18next.t("GEOLOCATE", {ns: "geolocation"});
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