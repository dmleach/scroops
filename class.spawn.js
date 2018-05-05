let BaseClass = require('class.base');

class SpawnClass extends BaseClass {

    static createByName(name) {
        return new SpawnClass(Game.spawns[name]);
    }

    manageCreeps() {
        let BaseCreepClass = require('class.creep');

        for (var roleId in BaseCreepClass.creepClasses) {
            let creepClass = BaseCreepClass.getClassByRole(roleId);
            console.log(creepClass.count);

        }
    }

}

module.exports = SpawnClass;
