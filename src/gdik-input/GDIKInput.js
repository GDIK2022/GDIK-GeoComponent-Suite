export default class GDIKInput extends HTMLElement {

    static get observedAttributes () {
        return ["lon", "lat", "zoom", "active-bg", "value"];
    }

    // Web Component Callback
    connectedCallback () {
        const shadow = this.attachShadow({mode: "open"});

        this.mapElement = document.createElement("gdik-map");
        if (this.hasAttribute("config-url")) {
            this.mapElement.setAttribute("config-url", this.getAttribute("config-url"));
        }

        this.mapElement.addEventListener("configloaded", this.handleConfigLoaded.bind(this));
        shadow.appendChild(this.mapElement);

        this.layerswitcherElement = document.createElement("gdik-layerswitcher");
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

            this.drawElement = document.createElement("gdik-draw");
            this.drawElement.slot = "content";
            this.drawElement.setAttribute("draw-type", this.getAttribute("draw-type"));

            if (this.hasAttribute("value")) {
                this.drawElement.setAttribute("feature", this.getAttribute("value"));
                this.input.value = this.getAttribute("value");
            }

            this.mapElement.appendChild(this.drawElement);
            this.observer.observe(this.drawElement, {attributes: true, childList: false, subtree: false});
        }

        this.geolocationElement = document.createElement("gdik-geolocation");
        this.geolocationElement.slot = "content";
        this.mapElement.appendChild(this.geolocationElement);
    }

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
        });
    }

    detachedCallback () {
        this.observer.disconnect();
    }

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
                if (this.drawElement === undefined) {
                    return;
                }
                this.drawElement.setAttribute(name, newValue);
                this.input.value = this.getAttribute("value");
                break;
            default:
                break;
        }
    }

    handleConfigLoaded (e) {
        const config = e.detail;

        if (config.portal.searchUrl) {
            this.searchElement = document.createElement("gdik-search");
            this.searchElement.slot = "content";
            this.searchElement.setAttribute("search-url", config.portal.searchUrl);
            this.searchElement.setAttribute("suggest-url", config.portal.suggestUrl);
            this.mapElement.appendChild(this.searchElement);
        }
    }
}

customElements.define("gdik-input", GDIKInput);
