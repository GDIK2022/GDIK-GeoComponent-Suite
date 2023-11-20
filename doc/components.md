### \<gcs-map\>

Simple map. Interactive presentation of geodata with minimal map controls: Zoom in/out and fullscreen mode

#### Attribues

| Name       | Required | Type       | Default    | Reactive | Description |
|------------|----------|------------|------------|----------|-------------|
| config-url | no       | string     | -          | no       | config file url |
| lon        | no       | string     | 448360.0   | yes      | center position |
| lat        | no       | string     | 5888434.0  | yes      | center position |
| active-bg  | no       | string     | 1001       | yes      | active background layer |
| zoom       | no       | number     | -          | yes      | Initial / current zoom level
| lng        | no       | string     | de         | yes      | Language of text elements like tooltips

#### Methods

##### getImage(mimetype)

This function returns a Base64 encoded string representation of current map section with all active back- and foreground layers.
The mimetype parameter is optional. The default is "image/png".

#### Example

```
<gcs-map config-url="data/config.json"
            lon="448360.0"
            lat="5888434.0"
            active-bg="1002">
</gcs-map>
```

### \<gcs-layerswitcher\>

**Have to be placed as child of \<gcs-map\>**

Map interface for changing background layers.

#### Attribues

None

#### Example

```
<gcs-map>
  <gcs-layerswitcher slot="content"></gcs-layerswitcher>
<gcs-map>
```

### \<gcs-draw\>

**Have to be placed as child of \<gcs-map\>**

Map interface for drawing a feature. It's possible to draw Points, Lines and Polygons. You can also pass a FeatureCollection into the feature attribute and it's available and editable. Current state of drawn geometry is available by feature attribute.

#### Attribues

| Name       | Required | Type       | Default    | Reactive | Description |
|------------|----------|------------|------------|----------|-------------|
| draw-type  | yes      | string     | -          | no       | One of "Point", "LineString", "Polygon" |
| feature    | no       | string     | -          | yes      | Feature Collection with feature (currently one feature is supported), added to draw mode

#### Example

```
<gcs-map>
  <gcs-draw slot="content"
             draw-type="Point"
             feature='{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[447539.7921095789,5888785.399549828]}]}'>
  </gcs-draw>
</gcs-map>
```

### \<gcs-search\>

**Have to be placed as child of \<gcs-map\>**

Map interface for searching in the map. It's possible to search for alot of variables depending the implemented search engine.

#### Attribues

| Name          | Required | Type       | Default    | Reactive | Description |
|---------------|----------|------------|------------|----------|-------------|
| search-url    | yes      | string     | -          | no       | url to the implmented search engine |
| search-string | no       | string     | -          | yes      | string to search in the map for |

#### Example

```
<gcs-map>
</gcs-map>
  <gcs-search  search-url="urltosearch"
             search-string="stade">
  </gcs-search>
```

### \<gcs-select\>

**Have to be placed as child of \<gcs-map\>**

Map interface for selecting a feature. Selected geometry is available by value attribute. Layer with selectable geometries is defined in config file passed to map by `interactionLayer` property of component property.

#### Attribues

| Name       | Required | Type       | Default    | Reactive | Description |
|------------|----------|------------|------------|----------|-------------|
| value      | no       | string     | -          | yes      | Feature Collection with selected feature (currently one feature is supported)

#### Example

```
<gcs-map>
  <gcs-select slot="content"></gcs-select>
</gcs-map>
```