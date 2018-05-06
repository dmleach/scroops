module.exports.loop = function () {

    // Clean old creeps out of memory
    for (let creepName in Memory.creeps) {
        if (!Game.creeps[creepName]) {
            delete Memory.creeps[creepName];
        }
    }

    // Iterate through all the friendly spawns and have them manage the creeps
    // in their room
    let SpawnClass = require('class.spawn');

    for (let spawnName in Game.spawns) {
        let spawn = SpawnClass.createByName(spawnName);
        spawn.manageCreeps();
    }

    // Iterate through all the friendly creeps and have them take an action
    let CreepHelper = require('helper.creep');

    for (let creepName in Game.creeps) {
        let creep = CreepHelper.createCreepByName(creepName);
        creep.act();
    }

}
