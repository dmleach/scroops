let BaseClass = require('class.base');

class SpawnClass extends BaseClass {

    static createByName(name) {
        return new SpawnClass(Game.spawns[name]);
    }

    manageCreeps() {
        let BaseCreepClass = require('class.creep');

        for (var classFile of BaseCreepClass.classFiles) {
            let creepClass = require(classFile);
            console.log('There should be at least ' + creepClass.minimumCount + ' ' + creepClass.description);
        }
    }

}

module.exports = SpawnClass;
