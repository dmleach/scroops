let CreepClass = require('class.creep');

class DistributorClass extends CreepClass {

    act() {
    }

    static get body() {
        return [MOVE, CARRY];
    }

    static get minimumCount() {
        return 1;
    }

    static get role() {
        return 'Distributor';
    }

}

module.exports = DistributorClass;
