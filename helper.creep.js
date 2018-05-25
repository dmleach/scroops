let BaseClass = require('class.base');

class CreepHelper extends BaseClass {

    static bodyCost(body) {
        this.incrementProfilerCount('CreepHelper.bodyCost');

        var cost = 0;

        for (var idxPart in body) {
            cost += BODYPART_COST[body[idxPart]];
        }

        return cost;
    }

    static createCreepById(id) {
        this.incrementProfilerCount('CreepHelper.createCreepById');

        let gameObject = Game.getObjectById(id);

        if (gameObject instanceof Creep) {
            return this.createCreepByName(gameObject.name);
        }
    }

    static createCreepByName(name) {
        this.incrementProfilerCount('CreepHelper.createCreepByName');

        let creep = Game.creeps[name];

        if (!creep) {
            throw new Error('Could not find creep with name ' + name);
        }

        let creepClass = this.getCreepClassByName(name);

        return new creepClass(creep);
    }

    static get creepClassFiles() {
        this.incrementProfilerCount('CreepHelper.creepClassFiles');

        return {
            Harvester: 'class.harvester',
            Distributor: 'class.distributor',
            Upgrader: 'class.upgrader',
            Builder: 'class.builder',
            Scout: 'class.scout',
        }
    }

    static getCreepClassByFileId(id) {
        this.incrementProfilerCount('CreepHelper.getCreepClassByFileId');

        let classFile = this.creepClassFiles[id];

        if (classFile) {
            return require(classFile);
        }

        throw new Error('Could not find class file for creep with id ' + id);
    }

    static getCreepClassByName(name) {
        this.incrementProfilerCount('CreepHelper.getCreepClassByName');

        let role = this.getRoleByName(name);
        return this.getCreepClassByRole(role);
    }

    static getCreepClassByRole(role) {
        this.incrementProfilerCount('CreepHelper.getCreepClassByRole');

        let creepClass = require(this.creepClassFiles[role]);

        if (!creepClass) {
            throw new Error('Could not find class for creep with role ' + role);
        }

        return creepClass;
    }

    static getCreepIdsByRole(role) {
        this.incrementProfilerCount('CreepHelper.getCreepIdsByRole');

        let creepIds = [];

        for (let creepName in Game.creeps) {
            let creep = this.createCreepByName(creepName);

            if (creep.role == role) {
                creepIds.push(creep.id);
            }
        }

        return creepIds;
    }

    static getRoleByName(name) {
        this.incrementProfilerCount('CreepHelper.getRoleByName');

        // A creep's role is defined by its name; specifically, everything in
        // the name that isn't a number
        return name.replace(/[0-9]/g, '');
    }

}

module.exports = CreepHelper;
