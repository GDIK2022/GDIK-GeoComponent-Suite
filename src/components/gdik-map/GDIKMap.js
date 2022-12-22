const merge = require("deepmerge");

import olCss from "bundle-text:../../../node_modules/ol/ol.css";

import DoubleClickZoom from "ol/interaction/DoubleClickZoom";
import Zoom from "ol/control/Zoom";
import FullScreen from "ol/control/FullScreen";

import mapsAPI from "masterportalAPI/src/maps/api.js";

// TODO remove default config file
import * as defaultConfig from "./assets/config.json";

import template from "./templates/GDIKMap.tmpl";
import LayerManager from "./LayerManager";

export default class GDIKMap extends HTMLElement {
    static get observedAttributes () {
        return ["lon", "lat", "active-bg", "zoom"];
    }

    constructor () {
        super();
        this.map = undefined;
        this.mapPromise = new Promise((resolve, reject) => {
            this.resolveMapPromise = resolve;
            this.rejectMapPromise = reject;
        });
        this.layerManager = undefined;
        this.container = undefined;
        this.configURL = undefined;
        this.config = undefined;
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

        if (this.hasAttribute("zoom")) {
            this.config.portal.startZoomLevel = this.getAttribute("zoom");
        }

        this.map = this.setupMap(this.config);

        if (this.hasAttribute("active-bg")) {
            this.layerManager.changeBackgroundLayer(this.getAttribute("active-bg")).catch(() => {
                // TODO implement
            });
        }

        this.setAttribute("lon", this.config.portal.startCenter[0]);
        this.setAttribute("lat", this.config.portal.startCenter[1]);
        this.setAttribute("zoom", this.config.portal.startZoomLevel);
        this.setAttribute("active-bg", this.layerManager.activeBackgroundLayer.get("id"));

        this.resolveMapPromise(this.map);


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
            case "zoom":
                this.map.getView().setZoom(newValue);
                break;
            case "active-bg":
                this.layerManager.changeBackgroundLayer(newValue).catch(() => {
                    // TODO implement
                });
                break;
            default:
                break;
        }
    }

    renderComponent () {
        const shadow = this.attachShadow({mode: "open"});

        shadow.appendChild(template.content.cloneNode(true));

        shadow.children[0].textContent = olCss + shadow.children[0].textContent;

        this.container = this.shadowRoot.querySelector(".gdik-map");

        shadow.querySelector("slot").addEventListener("slotchange", this.handleSlotChange.bind(this));

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
            loadedConfig = merge({}, defaultConfig);
        }
        this.dispatchEvent(new CustomEvent("configloaded", {detail: loadedConfig}));
        return loadedConfig;
    }

    handleSlotChange (event) {
        const children = event.target.assignedElements();

        this.mapPromise.then((map) => {
            children.forEach((child) => {
                try {
                    child.registerGDIKMap(map, this.layerManager);
                }
                catch (error) {
                    console.debug(error);
                }
            });
        });
    }

    setupMap (config) {
        let map = null,
            dobleClickZoom = null;

        config.portal.target = this.container;
        this.container.innerHTML = "";

        config.portal.layers = [];
        map = mapsAPI.map.createMap({...config.portal, layerConf: config.services}, "2D");

        this.layerManager = new LayerManager(map, config.portal.backgroundLayers);
        this.layerManager.on("backgroudchange", () => {
            this.setAttribute("active-bg", this.layerManager.activeBackgroundLayer.get("id"));
        });

        map.addControl(new Zoom());
        map.addControl(new FullScreen());

        // TODO move to draw?
        dobleClickZoom = this.getInteractionByClass(map, DoubleClickZoom);
        map.removeInteraction(dobleClickZoom);

        map.on("moveend", () => {
            this.center = map.getView().getCenter();
            this.setAttribute("lon", `${this.center[0]}`);
            this.setAttribute("lat", `${this.center[1]}`);
            this.setAttribute("zoom", map.getView().getZoom());
        });

        return map;
    }

    getInteractionByClass (map, c) {
        const founds = map.getInteractions().getArray().filter((interaction) => interaction instanceof c);

        return founds.length === 0 ? undefined : founds[0];
    }
}

customElements.define("gdik-map", GDIKMap);
