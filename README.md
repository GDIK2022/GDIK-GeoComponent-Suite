# GDIK Map
Interactive map as a web component based on masterportal API

### Attributes
#### Tag: <gdik-map>

| Name       | Required | Type       | Default    | Reactive | Description |
|------------|----------|------------|------------|----------|-------------|
| config-url | no       | string     | -          | no       | config file url |
| lon        | no       | string     | 448360.0   | yes      | center position |
| lat        | no       | string     | 5888434.0  | yes      | center position |
| layer      | no       | string     | 1001       | yes      |
| draw-type  | no       | string     | -          | no       | One of "Point", "LineString", "Polygon" |

### Examples
#### Example usage in Vue
```<gdik-map config-url="data/config.json" :lon="center[0]" :lat="center[1]"></gdik-map>```

## Development

### Setup
To start a development environment for development purposes follow these steps:

```npm install```

### Start examples server

```npm run examples```