const {initEntry} = require("./webpack.core");
const {addHTMLModules} = require("./webpack.core");

const DIST = "dist";

module.exports = function (_env, argv) {
    return [
        addHTMLModules(
            initEntry(DIST, "./src/popup/popup.tsx", "popup.js"),
            "./src/popup/popup.html", "popup.html", "popup.css"
        ),
        initEntry(DIST, "./src/bs.ts", "scripts/bs.js"),
    ];
};
