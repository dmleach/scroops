let BaseClass = require('class.base');

class SpawnClass extends BaseClass {

    static createByName(name) {
        return new SpawnClass(Game.spawns[name]);
    }

    /**
     * Returns the matching error description for the provided result of a call
     * to StructureSpawn.spawnCreep
     */
    static getSpawnErrorMessage(errorCode) {
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
        let BaseCreepClass = require('class.creep');

        for (var roleId in BaseCreepClass.creepClasses) {
            let creepClass = BaseCreepClass.getClassByRole(roleId);

            if (creepClass.count < creepClass.minimumCount) {
                try {
                    this.spawn(creepClass);
                } catch(error) {
                    if (Game.time % 5 == 0) {
                        console.log(error.message);
                    }
                }
            }
        }
    }

    /**
     * Spawns a new creep of the given class
     */
    spawn(creepClass) {
        let creepBody = creepClass.body;
        let creepName = creepClass.description + Game.time;
        let spawnResult = this.gameObject.spawnCreep(creepBody, creepName);

        if (spawnResult == OK) {
            return true;
        }

        throw new Error(
            this.name
            + ' tried to spawn ' + creepName
            + ' with body ' + creepBody
            + ' but received error "' + SpawnClass.getSpawnErrorMessage(spawnResult) + '"'
        );
    }

}

module.exports = SpawnClass;
