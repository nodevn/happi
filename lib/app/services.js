/**
 * BaseModelService
 *
 * @by Vunb
 * @date 09/12/2016
 *
 */
module.exports = class BaseModelService {
    constructor(model) {
        // init default model
        this.model = model;
    }

    /**
     * get model
     */
    getModel() {
        return this.model;
    }

    /**
     * Allow search and pagination
     */
    bySearch(criterias, pageSize, pageIndex) {

        let limit = (pageSize || 0) * 1;
        let skip = (pageIndex || 0) * limit;
        return this.model.find(criterias)
            .skip(skip)
            .limit(limit)
            .then((results) => {
                let count = this.model.count(criterias)
                    .then(result => {
                        return result;
                    });
                // return an Array promises
                return [results, count];
            })
            .spread((results, count) => {
                // return an object
                return {
                    total: count,
                    List: results
                };
            });
    }
}
