var helperEnergy = {

    calculateDepositSite: function(creep) {
        // If there are fewer harvesters than there should be and the spawn is not full, deposit energy there
        var helperCreeps = require('helper.creeps');
        var profiles = require('helper.profiles');

        if (helperCreeps.isNeeded(profiles.harvester)) {
            var spawn = Game.spawns['Spawn1'];

            if (spawn.energy < spawn.energyCapacity) {
                return spawn;
            }
        }

        var helperStructures = require('helper.structures');
        var containers = [];

        for (var roomName in Game.rooms) {
            containers = containers.concat(helperStructures.getStructures(Game.rooms[roomName], STRUCTURE_CONTAINER));
        }

        // Harvesters should deposit energy into containers that are no more than three spaces from
        // the source they're working
        if (creep.memory.role == profiles.harvester.creepType) {
            var harvestedSource = Game.getObjectById(creep.memory.harvestedSourceId);

            if (harvestedSource) {
                var closestContainer = false;
                var closestContainerDistance = 1000000;

                for (var idxContainer = 0; idxContainer < containers.length; idxContainer++) {
                    var container = containers[idxContainer];

                    if (container.store [RESOURCE_ENERGY] < container.storeCapacity) {
                        var containerDistance = harvestedSource.pos.findPathTo(container).length;

                        if (containerDistance <= 3) {
                            if (closestContainer == false || containerDistance < closestContainerDistance) {
                                closestContainer = container;
                                closestContainerDistance = containerDistance;
                            }
                        }
                    }
                }

                if (closestContainer !== false) {
                    return closestContainer;
                }
            }
        }

        // Harvesters should deposit energy into the closest container to the creep that has room
        var closestContainerDistance = Infinity;

        for (var idxContainer = 0; idxContainer < containers.length; idxContainer++) {
            var container = containers[idxContainer];

            if (container.store [RESOURCE_ENERGY] < container.storeCapacity) {
                var containerDistance = creep.pos.findPathTo(container).length;

                if (closestContainer == false || containerDistance < closestContainerDistance) {
                    closestContainer = container;
                    closestContainerDistance = containerDistance;
                }
            }
        }

        if (closestContainer !== false) {
            return closestContainer;
        }

        // If no appropriate container can be found, deposit the energy into the spawn
        var spawn = Game.spawns['Spawn1'];

        if (spawn.energy < spawn.energyCapacity) {
            return spawn;
        }

        return false;
    },

    calculateWithdrawalSite: function(creep) {
        // Creeps should not withdraw energy from any sources if any harvesters
        // are missing
        var helperCreeps = require('helper.creeps');
        var profiles = require('helper.profiles');

        if (helperCreeps.isNeeded(profiles.harvester)) {
            return false;
        }

        // Creeps should withdraw energy from containers in the base first
        var helperStructures = require('helper.structures');
        var containers = helperStructures.getStructures(creep.room, STRUCTURE_CONTAINER);
        var helperBase = require('helper.base');
        var closestContainer = false;
        var closestContainerDistance = Infinity;

        for (var idxContainer in containers) {
            var container = containers[idxContainer];

            if (helperBase.isInBase(container.pos) && container.store [RESOURCE_ENERGY] > 0) {
                var containerDistance = creep.pos.findPathTo(container).length;

                if (containerDistance < closestContainerDistance) {
                    closestContainer = container;
                    closestContainerDistance = containerDistance;
                }
            }
        }

        if (closestContainer) {
            return closestContainer;
        }

        // Next creeps should look for energy lying on the ground in the base
        var mostEnergySite = false;
        var mostEnergy = 0;
        var resources = creep.room.find(FIND_DROPPED_RESOURCES);

        for (var idxResource in resources) {
            var resource = resources[idxResource];

            if (helperBase.isInBase(resource.pos) && resource.amount > mostEnergy) {
                mostEnergySite = resource;
                mostEnergy = resource.amount;
            }
        }

        if (mostEnergySite) {
            return mostEnergySite;
        }

        return false;
    }

}

module.exports = helperEnergy;
