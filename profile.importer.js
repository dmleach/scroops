var profileImporter = {

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

    creepName: 'Importer',
    creepType: 6,
    energyType: 'Earner',
    renewable: true,
    roleScript: 'role.importer',

    shouldSpawn: function(spawn, helperLocations) {
        // Importers should spawn if there are sources in visible uncontrolled
        // rooms
        var sourceCount = 0;

        for (var idxSource in helperLocations.getSources()) {
            var source = helperLocations.getSources()[idxSource];

            if (source.room.controller) {
                if (!source.room.controller.owner) {
                    sourceCount++;
                }
            } else {
                sourceCount++;
            }
        }

        var helperCreeps = require('helper.creeps');
        var profiles = require('helper.profiles');
        var importerCount = helperCreeps.count(profiles.importer);

        // console.log('Importer count is ' + importerCount + ' of ' + sourceCount * 3);
        return importerCount < sourceCount * 3;
    },

    spawnGroup: 1,

}

module.exports = profileImporter;
