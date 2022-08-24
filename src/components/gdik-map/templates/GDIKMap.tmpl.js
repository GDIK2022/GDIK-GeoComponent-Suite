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

        .gdik-delete {
            left: 0.5em;
            top: 0.5em;
        }

        .gdik-delete button:disabled {
            background-color: #888;
        }
    </style>`;

template.innerHTML += "<div class=\"gdik-map-container\"></div>";

export default template;