let BaseClass = require('class.base');

class SpawnClass extends BaseClass {

    static createByName(name) {
        return new SpawnClass(Game.spawns[name]);
    }

    manageCreeps() {
        let BaseCreepClass = require('class.creep');

        for (var roleId in BaseCreepClass.creepClasses) {
            let creepClass = BaseCreepClass.getClassByRole(roleId);
            console.log(creepClass.description + ' count is ' + creepClass.count);
            console.log(creepClass.description + ' minimum count is ' + creepClass.minimumCount);

            if (creepClass.count < creepClass.minimumCount) {
                this.spawn(creepClass);
            }
        }
    }

    spawn(creepClass) {
        let creepName = creepClass.description + Game.time;
        let spawnResult = this.gameObject.spawnCreep([MOVE], creepName);

        if (spawnResult == OK) {
            return true;
        }

        throw new Error(this.name + ' tried to spawn a new ' + creepClass.description + ' but received error ' + spawnResult);
    }

}

module.exports = SpawnClass;
