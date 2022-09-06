const merge = require("deepmerge"),
    ID_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

import olCss from "bundle-text:../../../node_modules/ol/ol.css";

import DoubleClickZoom from "ol/interaction/DoubleClickZoom";
import Zoom from "ol/control/Zoom";
import FullScreen from "ol/control/FullScreen";

import mapsAPI from "masterportalAPI/src/maps/api.js";

// TODO remove default config file
import * as defaultConfig from "./assets/config.json";
import DrawControl from "./controls/draw";
import LayerswitcherControl from "./controls/layerswitcher";

import template from "./templates/GDIKMap.tmpl";
import LayerManager from "./LayerManager";

export default class GDIKMap extends HTMLElement {
    static get observedAttributes () {
        return ["lon", "lat", "active-bg"];
    }

    constructor () {
        super();
        this.map = undefined;
        this.layerManager = undefined;
        this.container = undefined;
        this.configURL = undefined;
        this.config = undefined;
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

        let featureCollection;

        if (this.hasAttribute("feature")) {
            featureCollection = JSON.parse(this.getAttribute("feature"));
        }

        this.map = this.setupMap(this.config, {
            drawType: this.getAttribute("draw-type"),
            featureCollection: featureCollection
        });

        if (this.hasAttribute("active-bg")) {
            this.layerManager.changeBackgroundLayer(this.getAttribute("active-bg"));
        }

        this.setAttribute("lon", this.config.portal.startCenter[0]);
        this.setAttribute("lat", this.config.portal.startCenter[1]);
        this.setAttribute("active-bg", this.layerManager.activeBackgroundLayer.get("id"));

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
            case "active-bg":
                this.layerManager.changeBackgroundLayer(newValue);
                break;
            default:
                break;
        }
    }

    renderComponent () {
        const shadow = this.attachShadow({mode: "open"});

        shadow.appendChild(template.content.cloneNode(true));

        shadow.children[0].textContent = olCss + shadow.children[0].textContent;

        this.container = shadow.children[1];

        this.container.id = this.generateContainerId();

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

        config.portal.layers = [];
        map = mapsAPI.map.createMap({...config.portal, layerConf: config.services}, "2D");

        this.layerManager = new LayerManager(map, config.portal.backgroundLayers);

        map.addControl(new LayerswitcherControl(this.layerManager));
        map.addControl(new Zoom());
        map.addControl(new FullScreen());

        dobleClickZoom = this.getInteractionByClass(map, DoubleClickZoom);
        map.removeInteraction(dobleClickZoom);

        map.on("moveend", () => {
            this.center = map.getView().getCenter();
            this.setAttribute("lon", `${this.center[0]}`);
            this.setAttribute("lat", `${this.center[1]}`);
        });

        if (options.drawType !== null || options.featureCollection !== undefined) {
            try {
                const drawControl = new DrawControl(this.layerManager, options);

                drawControl.on("featureupdate", () => {
                    this.setAttribute("feature", drawControl.getFeatureCollection());
                });
                map.addControl(drawControl);
            }
            catch (err) {
                console.error("Failed to create DrawControl");
                console.debug(`Original error was ${err}`);
            }
        }

        return map;
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

        return founds.length === 0 ? undefined : founds[0];
    }
}

customElements.define("gdik-map", GDIKMap);
