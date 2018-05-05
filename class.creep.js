// const CREEP_HARVESTER = 0;

class CreepClass {

    constructor(creep) {
        this.creepObject = creep;
    }

    static classByRoleId(id) {
        let classFile = CreepClass.creepFileNames.get(id);

        if (classFile) {
            return require(classFile);
        }

        throw 'Could not find class file for creep with id ' + id;
    }

    static get creepFileNames() {
        let C = require('constants');

        let fileNames = new Map();
        fileNames.set(C.ROLE_HARVESTER, 'class.harvester');

        return fileNames;
    }

    static createByName(name) {
        let creep = Game.creeps[name];

        if (!creep) {
            throw 'Could not find creep with name ' + name;
        }

        return new CreepClass(creep);
    }

    static get description() {
        return 'Base';
    }

    static get minimumCount() {
        return 0;
    }

}

Object.defineProperty(CreepClass, 'CREEP_HARVESTER', { value: 0, writable: false, enumerable: true });

module.exports = CreepClass;
