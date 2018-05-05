let BaseClass = require('class.base');

class SpawnClass extends BaseClass {
    static createByName(name) {
        return new SpawnClass(Game.spawns[name]);
    }

    manageCreeps() {
        let BaseCreepClass = require('class.creep');

        for (var classFile of BaseCreepClass.creepFileNames.values()) {
            let creepClass = require(classFile);
            console.log(creepClass.description);
        }
    }
}

module.exports = SpawnClass;
