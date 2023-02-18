const {tsEntry, withHTML} = require("./webpack.core");

const DIST = "static";

module.exports = function (env, argv) {
    const pathToEnv = `env/${env.env}.env`;
    console.log('Environment:', env, 'using env file', pathToEnv);
    require("dotenv").config({path: pathToEnv});
    const definitions = {
        'process.env.BACKEND_BASE': process.env.BACKEND_BASE,
        'process.env.STRIPE_PUBLIC_KEY': process.env.STRIPE_PUBLIC_KEY
    }
    console.log('Definitions:', definitions);
    return [
        withHTML(
            tsEntry(DIST, "./src/components/dashboard.tsx", "js/dashboard.js", definitions),
            "./src/components/dashboard.html", "dashboard.html", "css/dashboard.css"
        ),
        withHTML(
            tsEntry(DIST, "./src/components/pricing.tsx", "js/pricing.js", definitions),
            "./src/components/pricing.html", "pricing.html", "css/pricing.css"
        ),
        withHTML(
            tsEntry(DIST, "./src/components/index.tsx", "js/index.js", definitions),
            "./src/components/index.html", "index.html", "css/index.css"
        )
    ];
};
