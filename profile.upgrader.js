var profileUpgrader = {

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

    creepName: 'Upgrader',
    creepType: 2,
    energyType: 'Spender',
    renewable: true,
    roleScript: 'role.controlUpgrader',

    shouldSpawn: function(spawn, helperLocations) {
        var helperCreeps = require('helper.creeps');
        var profiles = require('helper.profiles');
        var upgraderCount = helperCreeps.count(profiles.upgrader);

        var structures = helperLocations.getStructures();
        var containerEnergy = 0;
        var containerEnergyCapacity = 0;
        var maximumUpgraders = 0;

        for (var idxStructure in structures) {
            var structure = helperLocations.getStructures()[idxStructure];

            if (structure instanceof StructureContainer) {
                containerEnergy += structure.store [RESOURCE_ENERGY];
                containerEnergyCapacity += structure.storeCapacity;
                maximumUpgraders += 3;
            }
        }

        var desiredUpgraderCount = (containerEnergy / containerEnergyCapacity) * maximumUpgraders;

        return upgraderCount + 1 < desiredUpgraderCount;
    },

    spawnGroup: 1,

}

module.exports = profileUpgrader;
