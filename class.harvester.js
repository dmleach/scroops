let CreepClass = require('class.creep');

class HarvesterClass extends CreepClass {

    act() {
    }

    static get body() {
        return [MOVE, CARRY, WORK];
    }

    static get minimumCount() {
        return 1;
    }

    static get role() {
        return 'Harvester';
    }

}

module.exports = HarvesterClass;
