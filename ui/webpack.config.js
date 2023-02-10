const {tsEntry, withHTML} = require("./webpack.core");

const DIST = "static";

module.exports = function (env, argv) {
    return [
        withHTML(
            tsEntry(DIST, "./src/components/dashboard.tsx", "js/dashboard.js"),
            "./src/components/dashboard.html", "dashboard.html", "css/dashboard.css"
        )
    ];
};
