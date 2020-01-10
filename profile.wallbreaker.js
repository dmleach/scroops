var profileWallbreaker = {

    active: true,
    baseBody: [MOVE, ATTACK],

    /** @param {Room} room **/
    body: function(room) {
        var bodyParts = this.baseBody;
        var helperCreeps = require('helper.creeps');
        var cost = helperCreeps.bodyPartCost(bodyParts);
        var availableEnergy = room.energyAvailable;

        if (cost > availableEnergy) {
            return false;
        }

        while (cost <= availableEnergy) {
            bodyParts.push(MOVE, ATTACK);
            cost = helperCreeps.bodyPartCost(bodyParts);
        }

        bodyParts.pop();
        bodyParts.pop();
        return bodyParts;
    },

    creepName: 'Wallbreaker',
    creepType: 10,
    energyType: 'Spender',
    renewable: false,
    roleScript: 'role.wallbreaker',

    shouldSpawn: function(spawn, helperLocations) {
        var roleWallbreaker = require('role.wallbreaker');

        if (roleWallbreaker.getBreakableWalls(helperLocations).length > 0) {
            var helperCreeps = require('helper.creeps');
            var profiles = require('helper.profiles');
            var wallbreakerCount = helperCreeps.count(profiles.wallbreaker);

            return wallbreakerCount < 1;
        }

        return false;
    },

    spawnGroup: 1,

}

module.exports = profileWallbreaker;
