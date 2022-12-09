export default class GDIKInput extends HTMLElement {

    static get observedAttributes () {
        return ["lon", "lat", "zoom", "active-bg", "feature"];
    }

    // Web Component Callback
    connectedCallback () {
        const shadow = this.attachShadow({mode: "open"});

        this.mapElement = document.createElement("gdik-map");
        shadow.appendChild(this.mapElement);

        this.layerswitcherElement = document.createElement("gdik-layerswitcher");
        this.layerswitcherElement.slot = "content";

        this.mapElement.appendChild(this.layerswitcherElement);

        GDIKInput.observedAttributes.concat(["config-url"]).forEach((attrName) => {
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

            if (this.hasAttribute("feature")) {
                this.drawElement.setAttribute("feature", this.getAttribute("feature"));
                this.input.value = this.getAttribute("feature");
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
            case "feature":
                if (this.drawElement === undefined) {
                    return;
                }
                this.drawElement.setAttribute(name, newValue);
                this.input.value = this.getAttribute("feature");
                break;
            default:
                break;
        }
    }
}

customElements.define("gdik-input", GDIKInput);
