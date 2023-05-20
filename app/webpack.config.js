const {tsEntry, withCSSInlined, withHTML} = require("./webpack.core");

const DIST = "dist";

module.exports = function (env, argv) {
    const pathToEnv = `env/${env.env}.env`;
    console.log("Environment:", env, "using env file", pathToEnv);
    require("dotenv").config({path: pathToEnv});
    const definitions = {
        "process.env.BACKEND_BASE": process.env.BACKEND_BASE,
        "process.env.SIGN_UP_URL": process.env.SIGN_UP_URL,
        "process.env.SENTRY_DISABLED": process.env.SENTRY_DISABLED,
        "process.env.SENTRY_URL": process.env.SENTRY_URL,
        "process.env.BYPASS_AUTH": process.env.BYPASS_AUTH,
    };
    console.log("Definitions:", definitions);

    const commonRules = [
        {
            test: /\.(png|jpe?g|gif|svg)$/i,
            use: [
                {
                    loader: "url-loader",
                    options: {
                        limit: 8192,
                        name: "static/media/[name].[hash:8].[ext]",
                    },
                },
            ],
        },
    ];

    return [
        tsEntry(DIST, "./src/bs.ts", "scripts/bs.js", definitions, commonRules),
        withCSSInlined(
            tsEntry(
                DIST,
                "./src/inpage.tsx",
                "content_scripts/inpage.js",
                definitions,
                commonRules
            )
        ),
        withHTML(
            tsEntry(DIST, "./src/popup/popup.tsx", "popup.js", definitions, commonRules),
            "./src/popup/popup.html",
            "popup.html",
            "popup.css"
        ),
        withHTML(
            tsEntry(DIST, "./src/maps/loader.tsx", "maps/loader.js", definitions, commonRules),
            "./src/maps/loader.html",
            "maps/loader.html",
            "maps/loader.css"
        ),
    ];
};
