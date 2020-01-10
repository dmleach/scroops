var roleHarvester = {

    /** @param {Creep} creep **/
    doDeposit: function(creep) {
        var helperEnergy = require('helper.energy');
        depositSite = this.getDepositSite(creep);

        if (depositSite) {
            if (creep.pos.getRangeTo(depositSite) > 1) {
                var moveResult = creep.moveTo(depositSite);
            }

            var depositResult = creep.transfer(depositSite, RESOURCE_ENERGY);

            switch (depositResult) {
                case OK:
                    creep.memory.depositSiteId = undefined;
                    break;
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(depositSite);
                    break;
            }
        }
    },

    /** @param {Creep} creep **/
    doHarvest: function(creep) {
        var harvestSite = this.getHarvestSite(creep);

        if (creep.pos.getRangeTo(harvestSite) > 1) {
            var moveResult = creep.moveTo(harvestSite);

            switch (moveResult) {
                case ERR_NO_PATH:
                    creep.memory.harvestedSourceId = undefined;
                    break;
            }
        }

        var resultCode = creep.harvest(harvestSite);

        switch (resultCode) {
            case OK:
                creep.memory.harvestedSourceId = harvestSite.id;
            case ERR_NOT_IN_RANGE:
                creep.moveTo(harvestSite);
        }
    },

    getActivity: function(creep) {
        var helperCreeps = require('helper.creeps');
        var bodyParts = helperCreeps.bodyParts(creep);
        var workCount = 0;

        for (var idxBodyPart in bodyParts) {
            if (bodyParts[idxBodyPart] == WORK) {
                workCount++;
            }
        }

        if (creep.carryCapacity - (workCount * 2) < creep.carry [RESOURCE_ENERGY]) {
            return 'Deposit';
        }

        return 'Harvest';
    },

    getClosestEnergySourceContainer: function(creep) {
        var closestContainer = false;
        var harvestedSource = Game.getObjectById(creep.memory.harvestedSourceId);

        if (harvestedSource) {
            var containers = harvestedSource.pos.findInRange(
                FIND_STRUCTURES,
                3,
                {filter: {structureType: STRUCTURE_CONTAINER}}
            );

            var closestContainerDistance = 1000000;

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
        }

        return closestContainer;
    },

    getDepositSite: function(creep) {
        if (creep.memory.depositSiteId) {
            var site = Game.getObjectById(creep.memory.depositSiteId);

            if (site) {
                if (site instanceof StructureSpawn) {
                    return site;
                }

                if (site.store [RESOURCE_ENERGY] < site.storeCapacity) {
                    return site;
                }
            }
        }

        creep.memory.depositSiteId = undefined;

        // If the room has a distributor, then the harvester should only deposit
        // into the containers near the energy source
        var helperCreeps = require('helper.creeps');
        var profiles = require('helper.profiles');

        if (helperCreeps.count(profiles.distributor) > 0) {
            var container = this.getClosestEnergySourceContainer(creep);

            if (container) {
                creep.memory.depositSiteId = container.id;
                return container;
            }

            // If all else fails, drop the energy on the ground
            creep.drop(RESOURCE_ENERGY);
            return;
        }

        // If there are no distributors, take the energy to the spawn
        creep.memory.depositSiteId = Game.spawns['Spawn1'].id;
        return Game.spawns['Spawn1'];
    },

    getHarvestSite: function(creep) {
        if (creep.memory.harvestSiteId) {
            var site = Game.getObjectById(creep.memory.harvestSiteId);

            if (site) {
                if (site.energy > 0) {
                    return site;
                }
            }
        }

        creep.memory.harvestSiteId = undefined;
        var sources = creep.room.find(FIND_SOURCES);
        var closestSource = false;
        var closestSourceDistance = Infinity;
        var helperObstacles = require('helper.obstacles');

        for (var idxSource in sources) {
            var source = sources[idxSource];

            if (source.energy > 0) {
                if (
                    creep.pos.getRangeTo(source.pos) == 1
                    || helperObstacles.getOpenSpacesAroundCount(source.pos) > 0
                ) {
                    var sourceDistance = creep.pos.findPathTo(source).length;

                    if (sourceDistance < closestSourceDistance) {
                        closestSource = source;
                        closestSourceDistance = sourceDistance;
                    }
                }
            }
        }

        if (closestSource) {
            creep.memory.harvestSiteId = closestSource.id;
            return closestSource;
        }

        return false;
    },

    /** @param {Creep} creep **/
    run: function(creep, helperLocations = undefined) {
        // Change the harvester's activity
        creep.memory.activity = this.getActivity(creep);

        if (creep.memory.activity == 'Deposit') {
	        this.doDeposit(creep);
	    } else if (creep.memory.activity == 'Harvest') {
	        this.doHarvest(creep);
	    }

	}
};

module.exports = roleHarvester;
