const {initEntry, addCSSModules, addHTMLModules} = require("./webpack.core");

const DIST = "dist";

module.exports = function (_env, argv) {
    return [
        addHTMLModules(
            initEntry(DIST, "./src/popup/popup.tsx", "popup.js"),
            "./src/popup/popup.html", "popup.html", "popup.css"
        ),
        addCSSModules(
            initEntry(DIST, "./src/inpage.tsx", "content_scripts/inpage.js"),
            "content/inpage.css"
        ),
        initEntry(DIST, "./src/bs.ts", "scripts/bs.js"),
    ];
};
