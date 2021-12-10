/* eslint-env node */

/*
 * babel needed for jesting: Node does not support import/export
 * .babelrc does not work here since it does not affect node_modules/ol (babel.config.js does)
 */
module.exports = function (api) {
    api.cache(false);
    const presets = [
            [
                "@babel/preset-env", {
                    "useBuiltIns": "entry",
                    "corejs": {
                        "version": 3
                    },
                    "targets": {
                        "browsers": ["defaults"]
                    }
                }
            ]
        ],
        plugins = [
            "@babel/plugin-transform-modules-commonjs"
        ];

    return {
        presets,
        plugins
    };
};
