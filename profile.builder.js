var profileBuilder = {

    active: true,
    baseBody: [MOVE, MOVE, CARRY, WORK],

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
            bodyParts.push(MOVE, CARRY, MOVE, WORK);
            cost = helperCreeps.bodyPartCost(bodyParts);

            if (cost > availableEnergy) {
                bodyParts.pop();
                bodyParts.pop();
                cost = helperCreeps.bodyPartCost(bodyParts);
            }
        }

        bodyParts.pop();
        bodyParts.pop();
        return bodyParts;
    },

    creepName: 'Builder',
    creepType: 3,
    desiredCount: 2,
    energyType: 'Spender',
    renewable: true,
    roleScript: 'role.builder',

    shouldSpawn: function(spawn, helperLocations) {
        // If there are no construction sites and there is a tower, there's no
        // need for a builder
        var towerCount = 0;

        for (var idxStructure in helperLocations.getStructures()) {
            var structure = helperLocations.getStructures()[idxStructure];

            if (structure instanceof StructureTower) {
                towerCount++;
            }
        }

        if (towerCount > 0 && helperLocations.getConstructions().length == 0) {
            return false;
        }

        var helperCreeps = require('helper.creeps');
        var profiles = require('helper.profiles');
        var builderCount = helperCreeps.count(profiles.builder);

        return builderCount < this.desiredCount;
    },

    spawnGroup: 1,

}

module.exports = profileBuilder;
