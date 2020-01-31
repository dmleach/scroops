let ScroopsObjectClass = require('ScroopsObject');

class UtilSort extends ScroopsObjectClass
{
    constructor(id) {
        super(id);

        this.SORT_ASCENDING = 'ascending';
        this.SORT_DESCENDING = 'descending';
    }

    get isShowingDebugMessages() {
        return false;
    }

    get name() {
        return 'UtilSort';
    }

    sort(objects, property = undefined, sortType = this.SORT_ASCENDING) {
        this.debug('Sorting');

        if (objects instanceof Array === false) {
            this.debug('Returning undefined because no array was provided');
            return undefined;
        }

        if (objects.length === 0) {
            this.debug('Returning empty array because given empty array');
            return [];
        }

        if (property !== undefined && property instanceof String === false && typeof property !== 'string') {
            this.debug('Returning undefined because given property ' + property + ' is not a string');
            return undefined;
        }

        if ([this.SORT_ASCENDING, this.SORT_DESCENDING].indexOf(sortType) === -1) {
            this.debug('Returning undefined because given sort type ' + sortType + ' is not valid');
            return undefined;
        }

        for (let idxObject = 0; idxObject < objects.length; idxObject++) {
            if (objects[idxObject] === undefined) {
                this.debug('Returning undefined because one of the given objects is undefined');
                return undefined;
            }

            if (property !== undefined) {
                this.debug('Returning undefined because ' + objects[idxObject] + ' does not have a ' + property + ' property');

                if (objects[idxObject][property] === undefined) {
                    return undefined;
                }
            }
        }

        this.debug('Parameters are valid');
        let sortClassInstance = this;

        let sortFunction = function(object1, object2) {
            sortClassInstance.debug('Object 1 is ' + object1);
            sortClassInstance.debug('Object 2 is ' + object2);

            let sortValue1 = property === undefined ? object1 : object1[property];
            let sortValue2 = property === undefined ? object2 : object2[property];

            if (sortType === sortClassInstance.SORT_ASCENDING) {
                if (sortValue1 < sortValue2) {
                    return -1;
                } else if (sortValue1 > sortValue2) {
                    return 1;
                } else {
                    return 0;
                }
            } else if (sortType === sortClassInstance.SORT_DESCENDING) {
                if (sortValue1 > sortValue2) {
                    return -1;
                } else if (sortValue1 < sortValue2) {
                    return 1;
                } else {
                    return 0;
                }
            }
        };

        objects.sort(sortFunction);
        this.debug('After sort is complete: ' + objects);
    }
}

module.exports = UtilSort;