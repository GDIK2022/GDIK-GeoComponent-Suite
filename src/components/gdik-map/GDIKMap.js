const merge = require("deepmerge");

import mapsAPI from "masterportalAPI/src/maps/api.js";

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
        this.config = await this.fetchConfig(this.configURL);

        if (this.hasAttribute("lon") && this.hasAttribute("lat")) {
            this.config.portal.startCenter = [this.getAttribute("lon"), this.getAttribute("lat")];
        }

        if (this.hasAttribute("layer")) {
            this.config.portal.layers = [{id: this.getAttribute("layer")}];
        }

        this.map = this.setupMap(this.config);

        this.setAttribute("lon", this.config.portal.startCenter[0]);
        this.setAttribute("lat", this.config.portal.startCenter[1]);
        this.setAttribute("layer", this.config.portal.layers[0].id);

        this.map.on("moveend", () => {
            this.center = this.map.getView().getCenter();
            this.setAttribute("lon", `${this.center[0]}`);
            this.setAttribute("lat", `${this.center[1]}`);
        });
    }

    getLayer (id) {
        const layers = this.map.getLayers().getArray();

        return layers.filter(layer => layer.get("id") === id);
    }

    async fetchConfig (configUrl) {
        let loadedConfig;

        if (!configUrl) {
            return merge({}, defaultConfig);
        }

        try {
            const resp = await fetch(configUrl);

            loadedConfig = await resp.json();
        }
        catch (err) {
            console.error(`Cannot reach given url: ${configUrl}`);
            console.debug(`Original error was ${err}`);
            console.warn("Fall back to default config");
            return merge({}, defaultConfig);
        }
        return loadedConfig;
    }

    setupMap (config) {
        config.portal.target = this.container;
        this.container.innerHTML = "";
        return mapsAPI.map.createMap({...config.portal, layerConf: config.services}, "2D");
    }

    attributeChangedCallback (name, oldValue, newValue) {
        if (!this.map || !this.container || !oldValue || newValue === oldValue) {
            return;
        }

        switch (name) {
            case "lon":
                this.map.getView().setCenter([newValue, this.map.getView().getCenter()[1]]);
                break;
            case "lat":
                this.map.getView().setCenter([this.map.getView().getCenter()[0], newValue]);
                break;
            case "layer":
                // remove all layers from map
                [...this.map.getLayers().getArray()].forEach((layer) => this.map.removeLayer(layer));
                this.map.addLayer(newValue);
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
