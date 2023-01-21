const {tsEntry, withCSSInlined, withHTML} = require("./webpack.core");

const DIST = "dist";

module.exports = function (env, argv) {
    const pathToEnv = `env/${env.env}.env`;
    console.log('Environment:', env, 'using env file', pathToEnv);
    require("dotenv").config({path: pathToEnv});
    const definitions = {
        'process.env.BACKEND_BASE': process.env.BACKEND_BASE
    }
    console.log('Definitions:', definitions);
    return [
        tsEntry(DIST, "./src/bs.ts", "scripts/bs.js", definitions),
        withCSSInlined(
            tsEntry(DIST, "./src/inpage.tsx", "content_scripts/inpage.js", definitions)
        ),
        withHTML(
            tsEntry(DIST, "./src/popup/popup.tsx", "popup.js", definitions),
            "./src/popup/popup.html", "popup.html", "popup.css"
        ),
        withHTML(
            tsEntry(DIST, "./src/maps/loader.tsx", "maps/loader.js", definitions),
            "./src/maps/loader.html", "maps/loader.html", "maps/loader.css"
        ),
    ];
};
