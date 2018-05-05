let CreepClass = require('class.creep');

class DistributorClass extends CreepClass {

    constructor() {
        super();
    }

    static get body() {
        return [MOVE, CARRY];
    }

    static get description() {
        return 'Distributor';
    }

    static get minimumCount() {
        return 1;
    }

}

module.exports = DistributorClass;
