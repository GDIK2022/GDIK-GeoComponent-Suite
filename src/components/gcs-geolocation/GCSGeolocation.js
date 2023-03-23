import GeolocationControl from "./geolocationControl";

export default class GCSGeolocation extends HTMLElement {

    constructor () {
        super();
        this.control = null;
    }

    registerGCSMap (map) {
        this.control = new GeolocationControl();
        map.addControl(this.control);
    }
}

customElements.define("gcs-geolocation", GCSGeolocation);