let CreepClass = require('class.creep');

class HarvesterClass extends CreepClass {

    constructor() {
        super();
    }

    static get description() {
        return 'Harvester';
    }

}

module.exports = HarvesterClass;
