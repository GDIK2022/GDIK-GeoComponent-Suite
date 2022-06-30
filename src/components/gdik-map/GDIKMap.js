import mpAPI from "masterportalAPI/abstraction/map";

// TODO remove default config file
import * as defaultConfig from "./assets/config.json";
// import 'babel-polyfill'

export default class GDIKMap extends HTMLElement {
    static get observedAttributes () {
        return ["lon", "lat", "layer"];
    }

    constructor () {
        super();
        this.map = undefined;
        this.container = undefined;
        this.configURL = undefined;
        this.config = undefined;
        this.activeLayer = undefined;
        window.errorMessages = [];
    }

    async connectedCallback () {
        // TODO set styling defaults in style file or block
        !this.hasAttribute("map-height") && this.setAttribute("map-height", "100%");
        !this.hasAttribute("map-width") && this.setAttribute("map-width", "100%");

        // init html container
        // TODO move to template and style files
        this.configURL = this.getAttribute("config-url");
        this.container = document.createElement("div");
        this.container.id = "map-div-id";
        this.container.style.height = this.getAttribute("map-height");
        this.container.style.width = this.getAttribute("map-width");
        this.container.style.margin = "auto";

        const shadow = this.attachShadow({mode: "open"});

        shadow.appendChild(this.container);

        // load defautconfig
        this.config = await this.fetchConfig();

        this.map = this.setupMap(this.config);

        // get attributes
        if (this.hasAttribute("lon") && this.hasAttribute("lat")) {
            this.center = [this.getAttribute("lon"), this.getAttribute("lat")];
            this.map.getView().setCenter(this.center);
        }
        else {
            this.center = this.map.getView().getCenter();
            this.setAttribute("lon", this.center[0]);
            this.setAttribute("lat", this.center[1]);
        }
        if (this.hasAttribute("layer")) {
            // TODO implement
        }
        else {
            // in default config we only have one layer defined atm
            this.activeLayer = this.getVisibleLayers()[0].get("id");
            this.setAttribute("layer", this.activeLayer);
        }

        this.map.on("moveend", () => {
            this.center = this.map.getView().getCenter();
            this.setAttribute("lon", `${this.center[0]}`);
            this.setAttribute("lat", `${this.center[1]}`);
        });
    }

    getLayer (id) {
        const layers = this.map.getLayers();

        return layers.find(layer => layer.getId() === id);
    }

    async fetchConfig () {
        let config = defaultConfig,
            response;

        if (!this.configURL) {
            return config;
        }

        try {
            response = await fetch(this.configURL);
            config = await response.json();
        }
        catch (err) {
            window.errorMessages
                .push(`Die angegebene URL: ${this.configURL} konnte nicht erreicht werden.`);
            window.errorMessages.push(err);
        }
        return config;
    }

    setupMap (config) {
        config.portal.target = this.container;
        this.container.innerHTML = "";
        return mpAPI.createMap({...config.portal, layerConf: config.services});
    }

    attributeChangedCallback (name, oldValue, newValue) {
        if (!this.map || !this.container || !oldValue || newValue === oldValue) {
            return;
        }

        switch (name) {
            case "lon":
                this.map.getView().setCenter([newValue, this.center[1]]);
                break;
            case "lat":
                this.map.getView().setCenter([this.center[0], newValue]);
                break;
            case "layer":
                if (this.config.services.some(service => service.id === newValue)) {
                    this.map.addLayer(newValue);
                    this.map.removeLayer(this.getLayer(oldValue));
                }
                else {
                    this.setAttribute("layer", oldValue);
                }
                break;
            default:
                break;
        }
    }

    getVisibleLayers () {
        return this.map.getLayers().getArray()
            .filter(layer => {
                return layer.getVisible();
            });
    }
}

customElements.define("gdik-map", GDIKMap);
