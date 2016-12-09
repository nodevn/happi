const http_methods = {
    create: "post",
    read: "get",
    update: "put",
    delete: "delete"
}

/**
 * get support http action by CRUD
 */
exports.http_methods = http_methods;

/**
 * get http action by CRUD definition
 */
exports.getHttpAction = function (curd) {
    if (!http_methods[curd]) {
        return curd;
    } else {
        return http_methods[curd];
    }
}