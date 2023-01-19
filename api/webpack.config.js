const {initEntry, addHTMLModules} = require("./webpack.core");

const DIST = "public";

module.exports = function (_env, argv) {
    return [
        addHTMLModules(
            initEntry(DIST, "./src/ui/index.tsx", "index.js"),
            "./src/ui/index.html", "index.html", "index.css"
        )
    ];
};
