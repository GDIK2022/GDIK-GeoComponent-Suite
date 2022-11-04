# Geo-Suite
Interactive map as a web component based on masterportal API with multiple additional feature components.

## Components

### \<gdik-input\>

Wrapper component for gdik-map with gdik-layerswitcher and gdik-draw.
Ready to use.

#### Attribues

| Name       | Required | Type       | Default    | Reactive | Description |
|------------|----------|------------|------------|----------|-------------|
| config-url | no       | string     | -          | no       | config file url |
| lon        | no       | string     | 448360.0   | yes      | center position |
| lat        | no       | string     | 5888434.0  | yes      | center position |
| active-bg  | no       | string     | 1001       | yes      | active background layer |
| draw-type  | no       | string     | -          | no       | One of "Point", "LineString", "Polygon" |
| feature    | no       | string     | -          | yes      | Feature Collection with feature (currently one feature is supported), added to draw mode

#### Example

```
<gdik-input config-url="data/config.json"
            lon="448360.0"
            lat="5888434.0"
            active-bg="1002"
            draw-type="Line">
</gdik-input>
```

### \<gdik-map\>

Simple map. Interactive presentation of geodata with minimal map controls: Zoom in/out and fullscreen mode

#### Attribues

| Name       | Required | Type       | Default    | Reactive | Description |
|------------|----------|------------|------------|----------|-------------|
| config-url | no       | string     | -          | no       | config file url |
| lon        | no       | string     | 448360.0   | yes      | center position |
| lat        | no       | string     | 5888434.0  | yes      | center position |
| active-bg  | no       | string     | 1001       | yes      | active background layer |

#### Example

```
<gdik-map config-url="data/config.json"
            lon="448360.0"
            lat="5888434.0"
            active-bg="1002">
</gdik-map>
```

### \<gdik-layerswitcher\>

**Have to be placed as child of \<gdik-map\>**

Map interface for changing background layers.

#### Attribues

None

#### Example

```
<gdik-map>
  <gdik-layerswitcher slot="content"></gdik-layerswitcher>
<gdik-map>
```

### \<gdik-draw\>

**Have to be placed as child of \<gdik-map\>**

Map interface for drawing a feature. It's possible to draw Points, Lines and Polygons. You can also pass a FeatureCollection into the feature attribute and it's available and editable. Current state of drawn geometry is available by feature attribute.

#### Attribues

| Name       | Required | Type       | Default    | Reactive | Description |
|------------|----------|------------|------------|----------|-------------|
| draw-type  | yes      | string     | -          | no       | One of "Point", "LineString", "Polygon" |
| feature    | no       | string     | -          | yes      | Feature Collection with feature (currently one feature is supported), added to draw mode

#### Example

```
<gdik-map>
  <gdik-draw slot="content"
             draw-type="Point"
             feature='{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[447539.7921095789,5888785.399549828]}]}'>
  </gdik-draw>
</gdik-map>
```

## Configuration

\<gdik-input\> and \<gdik-map\> accepts a `config-url` attribute pointing to a config file in json format.

### Schema

#### portal

This part contains the definition of the map, you will interact with. The section is based on the [masterportal mapView config](https://www.masterportal.org/files/masterportal/html-doku/doc/latest/config.json.html#markdown-header-portalconfigmapview) extended by the property *backgroundLayers*.

The backgroundLayers property is a list of layer ids defined in services section.

#### services

This part is the content of the [masterportal services.json file](https://www.masterportal.org/files/masterportal/html-doku/doc/latest/services.json.html). Every layer specified in this section can be added as background layer by it's id. See backgroundLayers property of portal part.

### Example
```
{
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
    "units": "m",
    "backgroundLayers": ["1001", "1002"]
  },
  "services": [
    {
      "id": "1001",
      "typ": "WMS",
      "name": "WebAtlasDe",
      "url": "https://sg.geodatenzentrum.de/wms_webatlasde__54a30b0f-b92f-34ba-39c0-3af32cfa13d6",
      "version": "1.1.1",
      "layers": "webatlasde",
      "transparent": true,
      "singleTile": false,
      "tilesize": 256,
      "gutter": 0
    },
    {
      "id": "1002",
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

### Examples

#### Example usage in Vue
```
<gdik-map config-url="data/config.json"
          :lon="center[0]"
          :lat="center[1]">
</gdik-map>
```

## Development

### Setup

To start a development environment for development purposes follow these steps:

```npm install```

### Start examples server

```npm run examples```

### Run tests
```npm run test```
or
```npm run test:watch```