/**
 * BaseController.js
 * @date: 2016/12/09
 */
'use strict';
var path = require("path"),
    baseUtil = require("./util"),
    rootDir = process.cwd(),
    logger = console;

class BaseController {
    constructor(model) {
        var self = this;
        this.model = model;
        this.logger = logger;
        this.name = this.constructor.name;
        logger.info("Controller Name: ", this.name);
    }

    getRouter() {
        var self = this;
        var express = require('express');
        var router = express.Router({
            mergeParams: true
        });

        // initialize actions
        var config = this._config || {
            actions: true
        };
        if (config.actions) {
            logger.info("Initialize actions for: ", this.constructor.name);
            let methodNames = Object.getOwnPropertyNames(self.__proto__);
            for (let methodName of methodNames) {
                // bind method context itself.
                let method = self[methodName].bind(self);
                logger.info(`Checking method: ${self.name}->${methodName}`);
                if (method instanceof Function) {
                    let tokens = methodName.split("_");
                    if (/^[$]/.test(methodName) || [
                            "create",
                            "read",
                            "update",
                            "delete",
                            "constructor"
                        ].indexOf(methodName) >= 0) {
                        logger.info("Skip action: ", methodName);
                        continue;
                    } else if (tokens.length == 1) {
                        let route = '/' + methodName + '/:id?';
                        logger.info(`Bind route ${self.name}: all ${route}`);
                        router.all(route, method);
                    } else if (tokens.length == 2) {
                        let action = baseUtil.getHttpAction(tokens[0]);
                        let route = '/' + tokens[1];
                        if (router[action]) {
                            logger.info(`Bind route: ${action} ${route}`);
                            router[action](route, method);
                        } else {
                            logger.info("Invalid action, skip: ", methodName);
                        }
                    } else {
                        // do nothing.
                    }
                }
            }
        }

        // default actions.
        logger.info(`Bind route CRUD for ${self.name} ...`);

        router.get('/import', function (req, res, next) {
            logger.info("Check import data ...");
            self.import(req, res, next, self.name);
        });

        router.post('/', function (req, res, next) {
            self.create(req, res, next);
        });

        router.get('/', function (req, res, next) {
            var id = req.params.id;
            if (!id) {
                logger.info("Check get all route ...");
                self.findAll(req, res, next);
            } else {
                logger.info("Get detail by id: ", id);
                return self.read(req, res, next);
            }
        });

        router.get('/:id', function (req, res, next) {
            logger.info("Check get route ...");
            self.read(req, res, next);
        });

        router.put('/:id', function (req, res, next) {
            self.update(req, res, next);
        });

        router.delete('/:id', function (req, res, next) {
            self.delete(req, res, next);
        });

        // end default actions.
        logger.info(`Bind route CRUD for ${self.name} is done.`);

        return router;
    }

    $getModel() {
        if (!this.model) {
            // return its service
            let service = this.$getService();
            this.model = service.getModel();
            return this.model;
        } else {
            return this.model;
        }
    }

    $getService() {
        if (!this.$service) {
            // init service
            var controllerName = path.basename(this.constructor.name, "Controller");
            var serviceName = `./${controllerName}Service`;
            var service = path.join(rootDir, "api", "services", serviceName);
            logger.info(`Preparing load service ${serviceName} ...`);
            this.$service = require(service);
            logger.info(`Preparing load service ${serviceName} done.`);
            return this.$service;
        } else {
            // return default $service
            return this.$service;
        }
    }

    /**
     * Tạo mới một đối tượng quản lý
     * @return: {,}
     */
    create(req, res, next) {
        var data = req.body;

        return this.$getModel()
            .create(data)
            .then((modelInstance) => {
                //TODO: create middleware res.ok(data);
                return res.json(modelInstance);
            }).catch((err) => {
                //TODO: create middleware res.serverError(data);
                logger.error(err);
                return res.status(500).json(err);
            });
    }

    read(req, res, next) {
        var id = req.params.id;
        logger.info("Read data model: " + this.name);
        if (!/^[-0-9a-fA-F]{24,36}$/.test(id)) {
            // Yes, it's not a valid ObjectId, otherwise proceed with `findById` call.
            return res.status(400).send("ObjectId is not valid: " + id);
        }

        // findRecordById
        return this.$getModel()
            .findById(id)
            // .exec()
            .then((modelInstance) => {
                //TODO: create middleware res.ok(data);
                return res.json(modelInstance);
            }).catch((err) => {
                //TODO: create middleware res.serverError(data);
                return res.status(500).json(err);
            });
    }

    /**
     * findAllRecord by query string, support pagination
     * @return: Array
     */
    findAll(req, res, next) {
        let page = req.query.pageIndex || 0;
        let limit = (req.query.pageSize || 0) * 1;
        let skip = page * limit;
        let query = {},
            qstr = req.query.qstr;

        // allow these conditions
        // abstract search if qstr appears
        for (let q in qstr) {
            if ("true" === qstr[q]) {
                query[q] = true;
            } else if ("false" === qstr[q]) {
                query[q] = false;
            } else if (q) {
                query[q] = qstr[q];
            }
        }

        logger.info(`findAllRecord: page=${page}, size=${limit}, query=${JSON.stringify(query)}`);
        return this.$getModel()
            .find(query)
            .skip(skip)
            .limit(limit)
            .then((results) => {
                //TODO: create middleware res.ok(data);
                let count = this.$getModel()
                    .count(query)
                    .then(result => {
                        return result;
                    });
                // return an Array promises
                return [results, count];
            }).spread((results, count) => {
                // return data to user
                return res.json({
                    total: count,
                    List: results
                });
            }).catch((err) => {
                //TODO: create middleware res.serverError(data);
                return res.status(500).json(err);
            });
    }

    update(req, res, next) {
        var id = req.params.id;
        var data = req.body;

        if (!/^[-0-9a-fA-F]{24,36}$/.test(id)) {
            // Yes, it's not a valid ObjectId, otherwise proceed with `findById` call.
            return res.status(400).send("ObjectId is not valid: " + id);
        }

        return this.$getModel()
            .findById(id)
            // .exec()
            .then((modelInstance) => {
                for (var attribute in data) {
                    if (data.hasOwnProperty(attribute) && attribute !== this.key && attribute !== "_id") {
                        modelInstance[attribute] = data[attribute];
                    }
                }
                return modelInstance.save();
            })
            .then((modelInstance) => {
                //TODO: create middleware res.ok(data);
                return res.json(modelInstance);
            }).catch((err) => {
                //TODO: create middleware res.serverError(data);
                return res.status(500).json(err);
            });
    }

    delete(req, res, next) {
        var id = req.params.id;

        if (!/^[-0-9a-fA-F]{24,36}$/.test(id)) {
            // Yes, it's not a valid ObjectId, otherwise proceed with `findById` call.
            return res.status(400).send("ObjectId is not valid: " + id);
        }

        return this.$getModel()
            .findById(id)
            // .exec()
            .then((modelInstance) => {
                if (!modelInstance) {
                    return modelInstance;
                }
                return modelInstance.remove();
            })
            .then((modelInstance) => {
                //TODO: create middleware res.ok(data);
                return res.json(modelInstance);
            }).catch((err) => {
                //TODO: create middleware res.serverError(data);
                return res.status(500).json(err);
            });
    }
}

// Export module
module.exports = new BaseController();
// Backwards-compat with node 0.10.x
exports.BaseController = BaseController;