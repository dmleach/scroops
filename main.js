module.exports.loop = function () {

    // Iterate through all the friendly spawns and have them manage the creeps
    // in their room
    let SpawnClass = require('class.spawn');

    for (var spawnName in Game.spawns) {
        var spawn = SpawnClass.createByName(spawnName);
        spawn.manageCreeps();
    }

    // Iterate through all the friendly creeps and have them take an action
    let CreepHelper = require('helper.creep');

    for (var creepName in Game.creeps) {
        let creep = CreepHelper.createCreepByName(creepName);
        creep.act();
    }

}
