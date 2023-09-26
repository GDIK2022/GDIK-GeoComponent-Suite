const merge = require("deepmerge");

import i18next from "i18next";

import olCss from "bundle-text:../../../node_modules/ol/ol.css";

import DoubleClickZoom from "ol/interaction/DoubleClickZoom";
import Zoom from "ol/control/Zoom";
import FullScreen from "ol/control/FullScreen";

import mapsAPI from "masterportalAPI/src/maps/api.js";

// TODO remove default config file
import * as defaultConfig from "./assets/config.json";

import template from "./templates/GCSMap.tmpl";
import LayerManager from "./LayerManager";
import StyleManager from "./StyleManager";

export default class GCSMap extends HTMLElement {
    static get observedAttributes () {
        return ["lon", "lat", "active-bg", "zoom", "lng"];
    }

    constructor () {
        super();
        this.map = undefined;
        this.mapPromise = new Promise((resolve, reject) => {
            this.resolveMapPromise = resolve;
            this.rejectMapPromise = reject;
        });
        this.layerManager = undefined;
        this.styleManager = undefined;
        this.container = undefined;
        this.configURL = undefined;
        this.config = undefined;

        this.lng = "de";
        this.i18next = i18next.createInstance();
        this.i18next.init({lng: this.lng, resources: {}});
        this.i18next.addResources("en", "map", {ZOOM_IN: "Zoom in", ZOOM_OUT: "Zoom out", FULLSCREEN: "Fullscreen"});
        this.i18next.addResources("de", "map", {ZOOM_IN: "Maßstab vergrößern", ZOOM_OUT: "Maßstab kleinern", FULLSCREEN: "Vollbild"});
        this.i18next.on("languageChanged", this.handleLanguageChange.bind(this));
    }

    // Web Component Callback
    async connectedCallback () {
        if (this.hasAttribute("lng")) {
            this.lng = this.getAttribute("lng");
            this.i18next.changeLanguage(this.lng);
        }

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
        this.setupControls(this.map);

        if (this.hasAttribute("active-bg")) {
            this.layerManager.changeBackgroundLayer(this.getAttribute("active-bg")).catch(() => {
                // TODO implement
            });
        }

        this.setAttribute("lon", this.config.portal.startCenter[0]);
        this.setAttribute("lat", this.config.portal.startCenter[1]);
        this.setAttribute("zoom", this.config.portal.startZoomLevel);
        this.setAttribute("active-bg", this.layerManager.activeBackgroundLayer.get("id"));
        this.setAttribute("lng", this.lng);

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
            case "lng":
                this.i18next.changeLanguage(newValue);
                break;
            default:
                break;
        }
    }

    renderComponent () {
        const shadow = this.attachShadow({mode: "open"});

        shadow.appendChild(template.content.cloneNode(true));

        shadow.children[0].textContent = olCss + shadow.children[0].textContent;

        this.container = this.shadowRoot.querySelector(".gcs-map");

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
                    // TODO refactor arguments to an Options-Object (except map)
                    child.registerGCSMap(map, this.layerManager, this.i18next, this.styleManager);
                }
                catch (error) {
                    console.debug(error);
                }
            });
        });
    }

    handleLanguageChange () {
        this.setupControls();
    }

    setupMap (config) {
        let map = null,
            dobleClickZoom = null;

        config.portal.target = this.container;
        this.container.innerHTML = "";

        config.portal.layers = [];
        map = mapsAPI.map.createMap({...config.portal, layerConf: config.services}, "2D");

        this.layerManager = new LayerManager(map, config.component.backgroundLayers, config.component?.foregroundLayer, config.component?.interactionLayer);
        this.layerManager.on("backgroudchange", () => {
            this.setAttribute("active-bg", this.layerManager.activeBackgroundLayer.get("id"));
        });

        // TODO move to draw?
        dobleClickZoom = this.getInteractionByClass(map, DoubleClickZoom);
        map.removeInteraction(dobleClickZoom);

        map.on("moveend", () => {
            this.center = map.getView().getCenter();
            this.setAttribute("lon", `${this.center[0]}`);
            this.setAttribute("lat", `${this.center[1]}`);
            this.setAttribute("zoom", map.getView().getZoom());
        });

        this.styleManager = new StyleManager(config.style, config.component.interactionLayerStyleId, config.component.interactionLayerHighlightStyleId);
        this.styleManager.addStyleToLayer(this.layerManager.foregroundLayer, true);
        this.layerManager.backgroundLayers.forEach(backgroundLayer => {
            this.styleManager.addStyleToLayer(backgroundLayer, true);
        });

        return map;
    }

    setupControls () {
        if (!this.map) {
            return;
        }

        if (this.zoomControl) {
            this.map.removeControl(this.zoomControl);
        }

        if (this.fullScreenControl) {
            this.map.removeControl(this.fullScreenControl);
        }

        this.zoomControl = new Zoom({
            zoomInTipLabel: this.i18next.t("ZOOM_IN", {ns: "map"}),
            zoomOutTipLabel: this.i18next.t("ZOOM_OUT", {ns: "map"})
        });
        this.fullScreenControl = new FullScreen({
            tipLabel: this.i18next.t("FULLSCREEN", {ns: "map"})
        });

        this.map.addControl(this.zoomControl);
        this.map.addControl(this.fullScreenControl);
    }

    getInteractionByClass (map, c) {
        const founds = map.getInteractions().getArray().filter((interaction) => interaction instanceof c);

        return founds.length === 0 ? undefined : founds[0];
    }
}

customElements.define("gcs-map", GCSMap);
