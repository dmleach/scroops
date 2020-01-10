var roleImporter = {

    /** @param {Creep} creep **/
    doDeposit: function(creep) {
        var depositSite = this.getDepositSite(creep);

        if (depositSite) {
            if (creep.pos.getRangeTo(depositSite) > 1) {
                var moveResult = creep.moveTo(depositSite);

                if (moveResult == ERR_NO_PATH) {
                    creep.memory.depositSiteId = undefined;
                }

                // If the importer just changed rooms, reevaluate deposit sites
                var helperExit = require('helper.exit');

                if (helperExit.isExit(creep.pos)) {
                    creep.memory.depositSiteId = undefined;
                }

                return;
            } else {
                if (creep.transfer(depositSite, RESOURCE_ENERGY) == OK) {
                    creep.memory.harvestSiteId = undefined;
                }
            }
        }
    },

    /** @param {Creep} creep **/
    doHarvest: function(creep, helperLocations) {
        var harvestSite = this.getHarvestSite(creep, helperLocations);

        if (harvestSite) {
            var range = creep.pos.getRangeTo(harvestSite.pos);

            if (range > 1) {
                var moveResult = creep.moveTo(harvestSite.pos);

                if (moveResult == ERR_NO_PATH) {
                    creep.memory.harvestSiteId = undefined;
                    creep.memory.harvestSiteBlacklist = harvestSite.id;
                }

                // // If the importer just changed rooms, reevaluate harvest sites
                // var helperExit = require('helper.exit');
                //
                // if (helperExit.isExit(creep.pos)) {
                //     creep.memory.harvestSiteId = undefined;
                // }

                return;
            }

            var resultCode = creep.harvest(harvestSite);

            switch (resultCode) {
                case OK:
                    creep.memory.harvestedSourceId = harvestSite.id;
                    creep.memory.harvestSiteBlacklist = undefined;
                    break;
                case ERR_NOT_OWNER:
                    creep.memory.harvestSiteId = undefined;
                    creep.memory.harvestSiteBlacklist = harvestSite.id;
                    break;
            }
        }
    },

    getActivity: function(creep) {
        var carriedEnergy = creep.carry [RESOURCE_ENERGY];

        if (carriedEnergy > 0) {
            if (carriedEnergy == creep.carryCapacity) {
                return 'Deposit';
            }

            var enemies = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5);

            for (idxEnemy in enemies) {
                var enemy = enemies[idxEnemy];

                if (ATTACK in enemy.body || RANGED_ATTACK in enemy.body) {
                    return 'Deposit';
                }
            }
        }

        return 'Harvest';
    },

    getDepositSite: function(creep) {
        if (creep.memory.depositSiteId) {
            var depositSite = Game.getObjectById(creep.memory.depositSiteId);

            if (depositSite) {
                if (depositSite instanceof StructureSpawn) {
                    return depositSite;
                }

                if (depositSite.store [RESOURCE_ENERGY] < depositSite.storeCapacity) {
                    return depositSite;
                }
            }
        }

        creep.memory.depositSiteId = undefined;

        // First, move to a friendly room
        var helperBase = require('helper.base');

        if (helperBase.isRoomFriendly(creep.room) == false) {
            creep.memory.depositSiteId = Game.spawns['Spawn1'].id;
            return Game.spawns['Spawn1'];

            // var helperRoute = require('helper.route');
            // var route = helperRoute.getRouteToNearestFriendlyRoom(creep.pos.room);
            //
            // if (route) {
            // }
        }

        // If the room has a distributor, take the energy to the closest
        // container
        var helperCreeps = require('helper.creeps');
        var profiles = require('helper.profiles');

        if (helperCreeps.count(profiles.distributor) > 0) {
            var helperStructures = require('helper.structures');
            var containers = helperStructures.getStructures(creep.room, STRUCTURE_CONTAINER);
            var closestContainer = false;

            // Only consider containers that are five steps away. If it's any
            // further, it's better to just drop the energy and let the
            // distributors handle it
            var closestContainerDistance = 6;

            for (var idxContainer in containers) {
                var container = containers[idxContainer];

                if (container.store [RESOURCE_ENERGY] < container.storeCapacity) {
                    var containerDistance = creep.pos.findPathTo(container).length;

                    if (containerDistance < closestContainerDistance) {
                        closestContainer = container;
                        closestContainerDistance = containerDistance;
                    }
                }
            }

            if (closestContainer) {
                creep.memory.depositSiteId = closestContainer.id;
                return closestContainer;
            }

            // If containers don't work, just drop the energy on the ground
            creep.drop(RESOURCE_ENERGY);
            return;
        }

        creep.memory.depositSiteId = Game.spawns['Spawn1'].id;
        return Game.spawns['Spawn1'];
    },

    getHarvestSite: function(creep, helperLocations) {
        var harvestSite = Game.getObjectById(creep.memory.harvestSiteId);

        if (harvestSite) {
            if (harvestSite.energy > 0) {
                return harvestSite;
            }
        }

        creep.memory.harvestSiteId = undefined;

        // Find the closest one of these sources that has no enemies near it
        var closestSource = false;
        var closestSourceDistance = Infinity;
        var helperCreeps = require('helper.creeps');
        var harvesters = helperCreeps.find(roleImporter);

        for (var idxSource in helperLocations.getSources()) {
            var source = helperLocations.getSources()[idxSource];
            var ignoreSource = false;

            if (source.room.controller) {
                if (source.room.controller.owner || source.room.controller.reservation) {
                    ignoreSource = true;
                }
            }

            if (creep.memory.harvestSiteBlacklist) {
                if (source.id == creep.memory.harvestSiteBlacklist) {
                    ignoreSource = true;
                }
            }

            if (!ignoreSource && (source.energy > 0)) {
                var enemies = source.pos.findInRange(FIND_HOSTILE_CREEPS, 2);
                var isEnemyArmed = false;

                for (var idxEnemy in enemies) {
                    var enemy = enemies[idxEnemy];

                    if (helperCreeps.isHostile(enemy)) {
                        isEnemyArmed = true;
                    }
                }

                if (!isEnemyArmed) {
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
	        this.doHarvest(creep, helperLocations);
	    }
	}
};

module.exports = roleImporter;
