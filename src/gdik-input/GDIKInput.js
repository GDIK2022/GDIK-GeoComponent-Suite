export default class GDIKInput extends HTMLElement {

    static get observedAttributes () {
        return ["lon", "lat", "zoom", "active-bg", "value"];
    }

    // Web Component Callback
    connectedCallback () {
        const shadow = this.attachShadow({mode: "open"});

        this.mapElement = document.createElement("gcs-map");
        if (this.hasAttribute("config-url")) {
            this.mapElement.setAttribute("config-url", this.getAttribute("config-url"));
        }

        this.mapElement.addEventListener("configloaded", this.handleConfigLoaded.bind(this));
        shadow.appendChild(this.mapElement);

        this.layerswitcherElement = document.createElement("gcs-layerswitcher");
        this.layerswitcherElement.slot = "content";

        this.mapElement.appendChild(this.layerswitcherElement);

        GDIKInput.observedAttributes.forEach((attrName) => {
            if (this.hasAttribute(attrName)) {
                this.mapElement.setAttribute(attrName, this.getAttribute(attrName));
            }
        });

        this.observer = new MutationObserver(this.handleObservedAttributeCallback.bind(this));
        this.observer.observe(this.mapElement, {attributes: true, childList: false, subtree: false});

        if (this.hasAttribute("draw-type")) {
            this.input = document.createElement("input");
            this.input.name = this.getAttribute("name") || "gdik-input";
            this.input.type = "hidden";
            this.appendChild(this.input);

            this.drawElement = document.createElement("gcs-draw");
            this.drawElement.slot = "content";
            this.drawElement.setAttribute("draw-type", this.getAttribute("draw-type"));

            if (this.hasAttribute("value")) {
                this.setValue(this.getAttribute("value"), true);
            }

            this.mapElement.appendChild(this.drawElement);
            this.observer.observe(this.drawElement, {attributes: true, childList: false, subtree: false});
        }

        this.geolocationElement = document.createElement("gcs-geolocation");
        this.geolocationElement.slot = "content";
        this.mapElement.appendChild(this.geolocationElement);
    }

    // Web Component Callback
    handleObservedAttributeCallback (mutationList) {
        mutationList.forEach((mutation) => {
            if (mutation.type !== "attributes") {
                return;
            }

            if (GDIKInput.observedAttributes.includes(mutation.attributeName)) {
                const newValue = mutation.target.getAttribute(mutation.attributeName);

                if (this.getAttribute(mutation.attributeName) === newValue) {
                    return;
                }
                this.setAttribute(mutation.attributeName, newValue);
            }

            if (mutation.attributeName === "feature") {
                const newValue = mutation.target.getAttribute(mutation.attributeName);

                this.setValue(newValue);
            }
        });
    }

    // Web Component Callback
    detachedCallback () {
        this.observer.disconnect();
    }

    // Web Component Callback
    attributeChangedCallback (name, oldValue, newValue) {
        if (oldValue === newValue) {
            return;
        }
        if (this.mapElement === undefined) {
            return;
        }
        switch (name) {
            case "lon":
            case "lat":
            case "zoom":
            case "active-bg":
                this.mapElement.setAttribute(name, newValue);
                break;
            case "value":
                this.setValue(this.getAttribute("value"), true);
                break;
            default:
                break;
        }
    }

    handleConfigLoaded (e) {
        const config = e.detail;

        if (config.component.searchUrl) {
            this.searchElement = document.createElement("gcs-search");
            this.searchElement.slot = "content";
            this.searchElement.setAttribute("search-url", config.component.searchUrl);
            this.searchElement.setAttribute("suggest-url", config.component.suggestUrl);
            this.mapElement.appendChild(this.searchElement);
        }
    }

    setValue (value, silent) {
        if (this.value !== undefined && this.input.value === value) {
            return;
        }

        this.setAttribute("value", value);

        let jsonValue = null;
        try {
            jsonValue = JSON.parse(value);
        } catch (e) {
            value = "";
        }

        this.value = jsonValue;

        this.input.value = value;
        if (this.drawElement !== undefined) {
            this.drawElement.setAttribute("feature", value);
        }

        if (silent === true) {
            return;
        }

        // InputEvent pass only text in data, so we have to use
        // string value as data
        this.dispatchEvent(new InputEvent("input", {
            data: value, composed: true, bubbles: true
        }));
        // CustomEvent can handle objects, so we can pass value
        // as object
        this.dispatchEvent(new CustomEvent("change", {
            detail: jsonValue, composed: true, bubbles: true
        }));
    }
}

customElements.define("gdik-input", GDIKInput);
