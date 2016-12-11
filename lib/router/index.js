var fs = require("fs");
var path = require("path");
var express = require('express');
var router = express.Router();
var logger = console;

function mappControllers(apiDir) {


    // fix for test 
    var rootDir = process.cwd();
    var controllerDir = apiDir || path.resolve(rootDir, "test/happi/api", "controllers");

    var files = fs.readdirSync(controllerDir);
    for (var fileName of files) {
        if (/^_/.test(fileName)) {
            logger.info("Ignoring __base controller: ", fileName);
            continue;
        } else if (/controller.js$/i.test(fileName)) {
            var controllerName = fileName.replace(/controller.js$/i, "").toLowerCase();
            logger.info(`Preparing load controller to bind Routes /${controllerName} (${fileName})`);
            var Controller = require(path.resolve(controllerDir, fileName));
            var childRouter = (new Controller).getRouter();

            router.use(`/${controllerName}`, childRouter);
        } else {
            logger.info("Ignoring file: ", fileName);
        }
    }

    // GET /foo
    router.get('/', function (req, res, next) {
        res.send('this is the index for apiv1');
    });
    return router;

}

module.exports = mappControllers;