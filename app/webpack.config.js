const {initEntry, addCSSInlineModules, addHTMLModules} = require("./webpack.core");

const DIST = "dist";

module.exports = function (_env, argv) {
    return [
        addHTMLModules(
            initEntry(DIST, "./src/popup/popup.tsx", "popup.js"),
            "./src/popup/popup.html", "popup.html", "popup.css"
        ),
        addHTMLModules(
            initEntry(DIST, "./src/maps/loader.tsx", "maps/loader.js"),
            "./src/maps/loader.html", "maps/loader.html", "maps/loader.css"
        ),
        addCSSInlineModules(
            initEntry(DIST, "./src/inpage.tsx", "content_scripts/inpage.js")
        ),
        initEntry(DIST, "./src/bs.ts", "scripts/bs.js"),
    ];
};
