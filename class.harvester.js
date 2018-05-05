let CreepClass = require('class.creep');

class HarvesterClass extends CreepClass {

    constructor() {
        super();
    }

    static get description() {
        return 'Harvester';
    }

    static get minimumCount() {
        return 1;
    }

}

module.exports = HarvesterClass;
