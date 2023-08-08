import GeolocationControl from "./geolocationControl";

export default class GCSGeolocation extends HTMLElement {

    constructor () {
        super();
        this.control = null;
    }

    registerGCSMap (map, layermanager, i18next) {
        i18next.addResources("en", "geolocation", {GEOLOCATE: "Center map in current location"});
        i18next.addResources("de", "geolocation", {GEOLOCATE: "Auf Standort zentrieren"});

        this.control = new GeolocationControl(i18next);
        map.addControl(this.control);
    }
}

customElements.define("gcs-geolocation", GCSGeolocation);