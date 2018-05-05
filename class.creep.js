var BaseClass = require('class.base');

class CreepClass extends BaseClass {

    act() {
        throw new Error('act method has not been defined for ' + this.name);
    }

    static get body() {
        throw new Error('body method has not been defined for ' + this.name);
    }

    static get count() {
        let count = 0;

        for (let creepName in Game.creeps) {
            // A creep's role is defined by the beginning of its name. A creep
            // whose name starts with "Harvester" is a Harvester
            if (this.getRole(creepName) == this.role) {
                count++;
            }
        }

        return count;
    }

    static getClassByFileId(id) {
        let classFile = CreepClass.creepClassFiles[id];

        if (classFile) {
            return require(classFile);
        }

        throw new Error('Could not find class file for creep with id ' + id);
    }

    static get minimumCount() {
        return 0;
    }

    static get role() {
        throw new Error('The base creep class does not have a role');
    }

    get role() {
        return this.constructor.role;
    }

}

module.exports = CreepClass;
