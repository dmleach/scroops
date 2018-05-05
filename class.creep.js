class CreepClass {

    constructor(creep) {
        this.creepObject = creep;
    }

    static createByName(name) {
        let creep = Game.creeps[name];

        if (!creep) {
            throw 'Could not find creep with name ' + name;
        }

        return new CreepClass(creep);
    }

    static get count() {
        let count = 0;

        for (let creepName in Game.creeps) {
            // A creep's role is defined by the beginning of its name. A creep
            // whose name starts with "Harvester" is a Harvester
            if (creepName.slice(0, this.description.length) == this.description) {
                count++;
            }
        }

        return count;
    }

    static get creepClasses() {
        return [
            'class.harvester',
            'class.distributor',
        ];
    }

    static get description() {
        return 'Base';
    }

    static getClassByRole(id) {
        let classFile = CreepClass.creepClasses[id];

        if (classFile) {
            return require(classFile);
        }

        throw 'Could not find class file for creep with id ' + id;
    }

    static get minimumCount() {
        return 0;
    }

}

module.exports = CreepClass;
