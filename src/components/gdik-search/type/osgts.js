export default class OSGTS {

    constructor (options) {
        this.searchUrl = options.searchUrl;
        this.suggestUrl = options.suggestUrl;
        this.extent = options.extent;
        this.srs = options.srs;
        this.entries = options.entries || 5;
    }

    async suggest (query) {
        return this.request(this.suggestUrl, query);
    }

    async search (query) {
        return this.request(this.searchUrl, query);
    }

    async request (url, query) {
        let req = url.replace(/\?$/, "");

        req += "?outputformat=json";

        if (this.extent !== undefined) {
            req += "&bbox=" + this.extent;
        }
        req += "&srsName=" + this.srs;
        req += "&query=" + encodeURIComponent(query);
        req += "&count=" + this.entries;

        return fetch(req).then((resp) => resp.json());
    }
}