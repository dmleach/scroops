let BaseClass = require('class.base');

class SpawnClass extends BaseClass {

    /**
     * Base energy is the amount of energy needed to spawn all possible creep
     * types. In other words, it's the energy needed to spawn the most expensive
     * basic-bodied creep
     */
    static get baseEnergy() {
        this.incrementProfilerCount('SpawnClass.baseEnergy');

        let highestCost = 0;
        let CreepHelper = require('helper.creep');

        for (var fileId in CreepHelper.creepClassFiles) {
            let creepClass = CreepHelper.getCreepClassByFileId(fileId);
            let bodyCost = CreepHelper.bodyCost(creepClass.bodyBase);

            if (bodyCost > highestCost) {
                highestCost = bodyCost;
            }
        }

        return highestCost;
    }

    static createByName(name) {
        this.incrementProfilerCount('SpawnClass.createByName');

        return new SpawnClass(Game.spawns[name]);
    }

    /**
     * Returns the matching error description for the provided result of a call
     * to StructureSpawn.spawnCreep
     */
    static getSpawnErrorMessage(errorCode) {
        this.incrementProfilerCount('SpawnClass.getSpawnErrorMessage');

        switch (errorCode) {
            case ERR_NOT_OWNER:
                return 'You are not the owner of this spawn';
            case ERR_NAME_EXISTS:
                return 'There is a creep with the same name already.';
            case ERR_BUSY:
                return 'The spawn is already in process of spawning another creep.';
            case ERR_NOT_ENOUGH_ENERGY:
                return 'The spawn and its extensions contain not enough energy to create a creep with the given body.';
            case ERR_INVALID_ARGS:
                return 'Body is not properly described or name was not provided.';
            case ERR_RCL_NOT_ENOUGH:
                return 'Your Room Controller level is insufficient to use this spawn.';
        }

        return 'Unknown error: ' + errorCode;
    }

    manageCreeps() {
        this.incrementProfilerCount('SpawnClass.manageCreeps');

        let priorities = this.priorities;
        let priorityValues = Object.keys(priorities).reverse();
        let CreepHelper = require('helper.creep');

        for (let idxValue in priorityValues) {
            let fileIds = priorities[priorityValues[idxValue]];

            for (let idxId in fileIds) {
                let creepClass = CreepHelper.getCreepClassByFileId(fileIds[idxId]);

                if (creepClass.getShouldSpawn(this.roomName)) {
                    try {
                        this.spawn(creepClass);
                        return true;
                    } catch(error) {
                        if (Game.time % 5 == 0) {
                            console.log(error.message);
                        }
                        return false;
                    }
                }
            }
        }
    }

    /**
     * Returns an object representing the priority of spawning the different
     * creep types
     */
    get priorities() {
        this.incrementProfilerCount('SpawnClass.priorities');

        let priorities = {};
        let CreepHelper = require('helper.creep');

        for (var fileId in CreepHelper.creepClassFiles) {
            let creepClass = CreepHelper.getCreepClassByFileId(fileId);
            let priority = creepClass.spawnPriority;

            if (!priorities[priority]) {
                priorities[priority] = [];
            }

            priorities[priority].push(fileId);
        }

        return priorities;
    }

    /**
     * Spawns a new creep of the given class
     */
    spawn(creepClass) {
        this.incrementProfilerCount('SpawnClass.spawn');

        let creepBody = creepClass.bodyByEnergy(this.gameObject.room.energyAvailable);

        if (!creepBody) {
            return false;
        }

        let creepName = creepClass.role + Game.time;
        let spawnResult = this.gameObject.spawnCreep(creepBody, creepName);

        if (spawnResult == OK) {
            return true;
        }

        let acceptableErrors = [ERR_BUSY];

        if (acceptableErrors.indexOf(spawnResult) == -1) {
            throw new Error(
                this.name
                + ' tried to spawn ' + creepName
                + ' with body ' + creepBody
                + ' but received error "' + SpawnClass.getSpawnErrorMessage(spawnResult) + '"'
            );
        }
    }

}

module.exports = SpawnClass;
