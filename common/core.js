var process = require('process');

module.exports = {
    getConfig: function () {
        return require('../config/' + process.env.TEST_ENV);
    }
}