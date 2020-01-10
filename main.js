module.exports.loop = function () {
    var helperLocations = require('helper.locations');

    // Clean old creeps out of memory
    var helperCreeps = require('helper.creeps');
    helperCreeps.cleanupCreepMemory();

    // Check configuration files
    var helperBase = require('helper.base');
    helperBase.isBaseValid();

    // Spawn new creeps, if they're needed
    var roleSpawner = require('role.spawner');
    roleSpawner.run(Game.spawns['Spawn1'], helperLocations);

    // Check for enemies and shoot them with towers
    var helperStructures = require('helper.structures');

    for (var roomName in Game.rooms) {
        var room = Game.rooms[roomName];
        var towers = helperStructures.getStructures(room, STRUCTURE_TOWER);

        for (var idxTower = 0; idxTower < towers.length; idxTower++) {
            var roleTower = require('role.tower');
            roleTower.run(towers[idxTower]);
        }
    }

    // Loop through all the active creeps and have them act
    var profiles = require('helper.profiles');

    for (var creepName in Game.creeps) {
        var startCpu = Game.cpu.getUsed();

        var creep = Game.creeps[creepName];
        var profile = profiles.getProfile(creep.memory.role);

        if (profile) {
            if (profile.active) {
                var role = require(profile.roleScript);
                role.run(creep, helperLocations);
            }
        }

        if (true) {
            var endCpu = Game.cpu.getUsed();
            var usedCpu = endCpu - startCpu;

            // if (usedCpu > 10) {
            //     console.log('Used ' + usedCpu + ' to process ' + creep.name + ' doing ' + creep.memory.activity);
            // }
        }
    }
}
