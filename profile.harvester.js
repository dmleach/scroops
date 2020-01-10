var profileHarvester = {

    active: true,
    baseBody: [MOVE, CARRY, WORK],

    /** @param {Room} room **/
    body: function(room) {
        var bodyParts = this.baseBody;
        var helperCreeps = require('helper.creeps');
        var cost = helperCreeps.bodyPartCost(bodyParts);
        var availableEnergy = room.energyAvailable;
        var workCount = 1;

        if (cost > availableEnergy) {
            return false;
        }

        // Six work parts take 12 energy per tick, meaning 3000 energy will be
        // harvested in 250 ticks, leaving 50 ticks for depositing the energy.
        // Any more work parts would therefore be useless
        while (workCount <= 6 && cost <= availableEnergy) {
            bodyParts.push(WORK);
            workCount++;
            cost = helperCreeps.bodyPartCost(bodyParts);
        }

        bodyParts.pop();
        return bodyParts;
    },

    creepName: 'Harvester',
    creepType: 1,
    energyType: 'Earner',
    renewable: true,
    roleScript: 'role.harvester',

    shouldSpawn: function(spawn, helperLocations) {
        var helperProfiles = require('helper.profiles');
        var helperCreeps = require('helper.creeps');
        var harvesterCreeps = helperCreeps.find(helperProfiles.harvester);

        // At most, there should be one harvester for every empty space around
        // the sources in friendly rooms
        var sourceSpaces = 0;
        var helperObstacles = require('helper.obstacles');

        for (var idxSource in helperLocations.getSources()) {
            var source = helperLocations.getSources()[idxSource];

            if (source.room.controller) {
                if (source.room.controller.my) {
                    sourceSpaces += helperObstacles.getWalkableSpacesAroundCount(source.pos);
                }
            }
        }

        if (harvesterCreeps.length >= sourceSpaces) {
            return false;
        }

        // At most, there should be six WORK body parts per source
        var workBodyParts = 0;


        for (var idxHarvester in harvesterCreeps) {
            var harvester = harvesterCreeps[idxHarvester];
            var bodyParts = helperCreeps.bodyParts(harvester);

            for (var idxPart in bodyParts) {
                if (bodyParts[idxPart] == WORK) {
                    workBodyParts++
                }
            }

        }

        return workBodyParts < helperLocations.getSources().length * 6;
    },

    spawnGroup: 1,

}

module.exports = profileHarvester;
