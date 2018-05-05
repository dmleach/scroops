module.exports.loop = function () {

    // Each spawn manages the creeps in its room
    let SpawnClass = require('class.spawn');

    for (var spawnName in Game.spawns) {        
        var spawn = SpawnClass.createByName(spawnName);
        spawn.manageCreeps();
    }

}
