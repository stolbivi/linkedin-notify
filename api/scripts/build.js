const fsExtra = require('fs-extra');
const args = require('minimist')(process.argv.slice(2));

const paths = {
    public: 'public',
};

function init() {
    console.log('Init for:', paths.public);
    fsExtra.emptyDirSync(paths.public);
}

switch (args['command']) {
    case 'init':
        init();
        break;
}

module.exports = paths;
