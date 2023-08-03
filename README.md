# GDIK GeoComponent Suite

The GDIK GeoComponent Suite is a collection of web components extending HTML form by geographical input elements.

A ready-to-use transpiled version of this component suite can be found [here](https://github.com/GDIK2022/GDIK-GeoComponent-Suite/releases/latest). Just download the ```gdik-geocomponent-suite.js``` file and add it to your project by using a script tag.

GeoComponent Suite is build upon the [masterportalAPI](https://bitbucket.org/geowerkstatt-hamburg/masterportalapi/src/master/) project.

## Components

### \<gdik-input\>

The `<gdik-input>` element is used to create interactive map controls for web-based forms in order to accept geometries from the user. Geometries can be points, lines and polygons drawn by the user. User input data can be accessed by using the *feature* attribute. Input data is also submitted when the surrounding form is submitted.

The element can be customized by providing an URL pointing to a config file to the *config-url* attribute. The config file is based on masterportalAPI config schema documented in the [masterportal project](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev/).


#### Attributes

| Name       | Required | Type       | Default    | Reactive | Description |
|------------|----------|------------|------------|----------|-------------|
| config-url | no       | string     | -          | no       | config file url |
| lon        | no       | string     | 448360.0   | yes      | center position |
| lat        | no       | string     | 5888434.0  | yes      | center position |
| active-bg  | no       | string     | 1001       | yes      | active background layer |
| draw-type  | no       | string     | -          | no       | One of "Point", "LineString", "Polygon" |
| value      | no       | string     | -          | yes      | Feature Collection with feature (currently one feature is supported), added to draw mode
| search-string  | no       | string     | -          | yes       | string to search in the map for  |

#### Events

##### "input"

When value is changed the component emits an event of type "input". Current component value is added to data attribute of event as string.

##### "change"

When value is changed the component emits an event of type "change". Current component value is added to detail attribute of event as object or null.

#### Example

```
<gdik-input config-url="data/config.json"
            lon="448360.0"
            lat="5888434.0"
            active-bg="1002"
            draw-type="Line">
</gdik-input>
```

## Configuration

`<gdik-input>` accepts a URL pointing to a config file given in *config-url* attribute. The config file is in json format. The configuration file is divided into three main sections:

### component

This part contains `<gdik-input>` specific parameters. The following properties are included in this section:

<dl>
  <dt><b>backgroundLayers</b></dt>
  <dd>List of layer ids defined in services section to be present as background layer in component</dd>
  <dt><b>foregroundLayer</b></dt>
  <dd>Layer id defined in services section to be present as the foreground layer in component</dd>
  <dt><b>searchUrl</b></dt>
  <dd>Url of OSGTS to use for geocoding (gdik-search)</dd>
</dl>

### portal

This part contains the definition of the map, you will interact with. The section is based on the [masterportal mapView config](https://www.masterportal.org/files/masterportal/html-doku/doc/latest/config.json.html#markdown-header-portalconfigmapview).


### services

This part is the content of the [masterportal services.json file](https://www.masterportal.org/files/masterportal/html-doku/doc/latest/services.json.html). Every layer specified in this section can be added as background layer by it's id. See backgroundLayers property of component part.

### Example
```
{
  "component": {
    "backgroundLayers": ["basemap", "topplus"],
    "foregroundLayer": "overlay",
    "searchUrl": "https://osgts.example.com"
  },
  "portal": {
    "epsg": "EPSG:25832",
    "namedProjections": [
      ["EPSG:31467", "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
      ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
      ["EPSG:8395", "+title=ETRS89/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
      ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
    ],
    "extent": [400000.0, 5000000.0, 500000.0, 6000000.0],
    "startCenter": [448360.0, 5888434.0],
    "startZoomLevel": 6,
    "units": "m"
  },
  "services": [
    {
      "id": "basemap",
      "typ": "WMS",
      "name": "basemap.de",
      "url": "https://sgx.geodatenzentrum.de/wms_basemapde",
      "version": "1.3.0",
      "layers": "de_basemapde_web_raster_farbe",
      "transparent": true,
      "singleTile": false,
      "tilesize": 256,
      "gutter": 0
    },
    {
      "id": "topplus",
      "typ": "WMS",
      "name": "TopPlusOpen - Farbe",
      "url": "https://sgx.geodatenzentrum.de/wms_topplus_open",
      "version": "1.1.1",
      "layers": "web",
      "transparent": true,
      "singleTile": false,
      "tilesize": 256,
      "gutter": 20
    },
    {
      "id": "overlay",
      "typ": "WMS",
      "name": "TopPlusOpen - Farbe",
      "url": "https://sgx.geodatenzentrum.de/wms_topplus_open",
      "version": "1.1.1",
      "layers": "web",
      "transparent": true,
      "singleTile": false,
      "tilesize": 256,
      "gutter": 20
    }
  ]
}
```

## Resources

- [Masterportal documentation](https://www.masterportal.org/documentation.html)
- [OpenSearch Geo and Time Extensions Definition](https://repository.oceanbestpractices.org/bitstream/handle/11329/1079/10-032r8_OGC_OpenSearch_Geo_and_Time_Extensions.pdf?sequence=1&isAllowed=y)
