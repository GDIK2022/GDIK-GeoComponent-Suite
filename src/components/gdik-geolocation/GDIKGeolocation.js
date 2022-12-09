import GeolocationControl from "./geolocationControl";

export default class GDIKGeolocation extends HTMLElement {

    constructor () {
        super();
        this.control = null;
    }

    registerGDIKMap (map) {
        this.control = new GeolocationControl();
        map.addControl(this.control);
    }
}

customElements.define("gdik-geolocation", GDIKGeolocation);