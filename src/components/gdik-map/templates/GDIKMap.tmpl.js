const template = document.createElement("template");

template.innerHTML = `<style>
        .ol-full-screen {
            top: auto;
            bottom: 0.5em;
        }

        .ol-zoom {
            left: auto;
            right: 0.5em;
        }

        .gdik-map-container {
            height: 100%;
            width: 100%;
            margin: auto;
        }

        .gdik-map {
            height: 100%;
            width: 100%;
            margin: auto;
        }

        .gdik-geolocation {
            left: auto;
            right: 0.5em;
            top: 4em;
            bottom: auto;
        }

        .gdik-delete {
            left: 0.5em;
            top: 0.5em;
        }

        .gdik-delete button:disabled {
            background-color: #888;
        }

        .gdik-layerswitcher {
            left: 0.5em;
            bottom: 0.5em;
            display: flex;
            flex-direction: row;
            align-items: flex-end;
        }

        .gdik-layerswitcher.ol-control .hidden {
            display: none;
        }

        .gdik-layerswitcher .closer {
            display: inline-block;
        }

        .gdik-layerswitcher ul {
            padding: 0;
            margin: 0;
            display: inline-block;
            background-color: ghostwhite;
        }

        .gdik-layerswitcher ul li {
            display: block;
            border: 1px solid rgba(0, 0, 0, .125);
            white-space: nowrap;
            padding: 0.2em 0.4em;
        }

        .gdik-layerswitcher ul li.active {
            background-color: #003c8880;
        }

        .gdik-search {
            left: auto;
            right: auto;
            width: 60%;
            top: 0.5em;
            bottom: auto;
            margin: 0 auto;
            position: relative;
        }

        .gdik-search input {
            width: 100%;
        }

        .gdik-search .gdik-search-results div {
            padding: 2px;
            background-color: white;
            cursor: pointer;
        }

        .gdik-search .gdik-search-results div:nth-child(odd) {
            padding: 2px;
            background-color: whitesmoke;
        }

        .gdik-search .gdik-search-results div:last-child {
            border-radius: 0 0 4px 4px;
        }

        .gdik-search .gdik-search-results div:hover {
            background-color: lightgray;
        }
    </style>`;

template.innerHTML += "<div class=\"gdik-map\"></div><slot name=\"content\"></slot>";

export default template;