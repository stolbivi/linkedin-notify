const {tsEntry, withHTML} = require("./webpack.core");

const DIST = "public";

module.exports = function (env, argv) {
    return [
        withHTML(
            tsEntry(DIST, "./src/ui/index.tsx", "index.js"),
            "./src/ui/index.html", "index.html", "index.css"
        )
    ];
};
