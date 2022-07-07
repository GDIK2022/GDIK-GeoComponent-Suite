const merge = require("deepmerge"),
    ID_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

import DoubleClickZoom from "ol/interaction/DoubleClickZoom";
import Zoom from 'ol/control/Zoom';
import FullScreen from 'ol/control/FullScreen';

import mapsAPI from "masterportalAPI/src/maps/api.js";

// TODO remove default config file
import * as defaultConfig from "./assets/config.json";
import DrawControl from "./controls/draw";

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
        this.drawControl = undefined;
    }

    // Web Component Callback
    async connectedCallback () {
        this.renderComponent();

        // load defautconfig
        this.configURL = this.getAttribute("config-url");
        this.config = await this.fetchConfig(this.configURL);

        if (this.hasAttribute("lon") && this.hasAttribute("lat")) {
            this.config.portal.startCenter = [this.getAttribute("lon"), this.getAttribute("lat")];
        }

        if (this.hasAttribute("layer")) {
            this.config.portal.layers = [{id: this.getAttribute("layer")}];
        }

        this.map = this.setupMap(this.config, {drawType: this.getAttribute("draw-type")});

        this.setAttribute("lon", this.config.portal.startCenter[0]);
        this.setAttribute("lat", this.config.portal.startCenter[1]);
        this.setAttribute("layer", this.config.portal.layers[0].id);
    }

    // Web Component Callback
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

    renderComponent () {
        this.container = document.createElement("div");
        this.container.id = this.generateContainerId();
        this.container.style.height = "100%";
        this.container.style.width = "100%";
        this.container.style.margin = "auto";

        const shadow = this.attachShadow({mode: "open"});

        shadow.appendChild(this.container);
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

    setupMap (config, options) {
        let map = null,
            dobleClickZoom = null;

        config.portal.target = this.container;
        this.container.innerHTML = "";

        map = mapsAPI.map.createMap({...config.portal, layerConf: config.services}, "2D");

        map.addControl(new Zoom());
        map.addControl(new FullScreen())

        dobleClickZoom = this.getInteractionByClass(map, DoubleClickZoom);
        map.removeInteraction(dobleClickZoom);

        map.on("moveend", () => {
            this.center = map.getView().getCenter();
            this.setAttribute("lon", `${this.center[0]}`);
            this.setAttribute("lat", `${this.center[1]}`);
        });

        if (options.drawType !== null) {
            try {
                this.drawControl = new DrawControl(options);
                this.drawControl.on("featureupdate", () => {
                    this.setAttribute("feature", this.drawControl.getFeatureCollection());
                });
                map.addControl(this.drawControl);
            }
            catch (err) {
                console.error("Failed to create DrawControl");
                console.debug(`Original error was ${err}`);
            }
        }

        return map;
    }

    getVisibleLayers () {
        return this.map.getLayers().getArray()
            .filter(layer => {
                return layer.getVisible();
            });
    }

    generateContainerId (len) {
        const length = len || 6;
        let result = "";

        for (let i = 0; i < length; i++) {
            result += ID_CHARS.charAt(Math.floor(Math.random() * ID_CHARS.length));
        }
        return `gdik-map-div-${result}`;
    }

    getInteractionByClass (map, c) {
        const founds = map.getInteractions().getArray().filter((interaction) => interaction instanceof c);

        if (founds.length === 0) {
            return undefined;
        }
        return founds[0];
    }
}

customElements.define("gdik-map", GDIKMap);
