class CreepHelper {

    static bodyCost(body) {
        var cost = 0;

        for (var idxPart in body) {
            cost += BODYPART_COST[body[idxPart]];
        }

        return cost;
    }

    static createCreepByName(name) {
        let creep = Game.creeps[name];

        if (!creep) {
            throw new Error('Could not find creep with name ' + name);
        }

        let creepClass = this.getCreepClassByName(name);

        return new creepClass(creep);
    }

    static getCreepClassByFileId(id) {
        let classFile = this.creepClassFiles[id];

        if (classFile) {
            return require(classFile);
        }

        throw new Error('Could not find class file for creep with id ' + id);
    }

    static getCreepClassByName(name) {
        let role = this.getRoleByName(name);
        return this.getCreepClassByRole(role);
    }

    static getCreepClassByRole(role) {
        for (let fileId in this.creepClassFiles) {
            let creepClass = require(this.creepClassFiles[fileId]);

            if (creepClass.role == role) {
                return creepClass;
            }
        }

        throw new Error('Could not find class for creep with role ' + role);
    }

    static get creepClassFiles() {
        return [
            'class.harvester',
            'class.distributor',
            'class.upgrader',
            'class.builder',
        ];
    }

    static getRoleByName(name) {
        // A creep's role is defined by its name; specifically, everything in
        // the name that isn't a number
        return name.replace(/[0-9]/g, '');
    }

}

module.exports = CreepHelper;
