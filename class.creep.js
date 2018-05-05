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

    static createByName(name) {
        let creep = Game.creeps[name];

        if (!creep) {
            throw 'Could not find creep with name ' + name;
        }

        return new CreepClass(creep);
    }

    static get classFileMap() {
        let C = require('constants');

        let fileMap = new Map();
        fileMap.set(C.ROLE_HARVESTER, 'class.harvester');

        return fileMap;
    }

    static get classFiles() {
        return CreepClass.classFileMap.values();
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
