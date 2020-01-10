var roleScavenger = {

    doDeposit: function(creep) {
        var depositSite = this.getDepositSite(creep);

        if (!depositSite) {
            return false;
        }

        if (creep.pos.getRangeTo(depositSite) > 1) {
            var moveResult = creep.moveTo(depositSite);

            if (moveResult == ERR_NO_PATH) {
                creep.memory.depositSiteId = undefined;
            }

            var helperExit = require('helper.exit');

            if (helperExit.isExit(creep.pos)) {
                creep.memory.depositSiteId = undefined;
            }

            return;
        }

        var transferResult = creep.transfer(depositSite, RESOURCE_ENERGY);

        switch (transferResult) {
            case OK:
                creep.memory.depositSiteId = undefined;
                break;
            case ERR_NOT_IN_RANGE: {
                creep.moveTo(depositSite);
                break;
            }
        }
    },

    doScavenge: function(creep) {
        var withdrawSite = this.getWithdrawSite(creep);

        if (withdrawSite) {
            if (creep.pos.getRangeTo(withdrawSite) > 1) {
                creep.moveTo(withdrawSite);
                return true;
            }

            if (withdrawSite instanceof Tombstone) {
                var withdrawResult = creep.withdraw (withdrawSite, RESOURCE_ENERGY);
            } else if (withdrawSite instanceof Resource) {
                var withdrawResult = creep.pickup (withdrawSite);
            }

            if (withdrawResult == ERR_NOT_IN_RANGE) {
                creep.moveTo(withdrawSite);
            }
        }
    },

    getActivity: function(creep) {
        var carriedEnergy = creep.carry [RESOURCE_ENERGY];

        if (carriedEnergy > 0) {
            if (carriedEnergy == creep.carryCapacity) {
                return 'Deposit';
            }
        }

        return 'Scavenge';
    },

    getDepositSite: function(creep) {
        // First fill up the spawns
        var spawns = creep.room.find(FIND_MY_SPAWNS);

        for (var idxSpawn = 0; idxSpawn < spawns.length; idxSpawn++) {
            var spawn = spawns[idxSpawn];

            if (spawn.energy < spawn.energyCapacity) {
                return spawn;
            }
        }

        // Give the tower some energy, but only if it's empty
        for (var idxStructure in structures) {
            var structure = structures[idxStructure];

            if (structure.structureType == STRUCTURE_TOWER) {
                if (structure.energy == 0) {
                    return structure;
                }
            }
        }

        // Second fill up the extensions
        var structures = creep.room.find(FIND_STRUCTURES);

        for (var idxStructure = 0; idxStructure < structures.length; idxStructure++) {
            var structure = structures[idxStructure];

            if (structure.structureType == STRUCTURE_EXTENSION) {
                if (structure.energy < structure.energyCapacity) {
                    return structure;
                }
            }
        }

        // Third fill up containers that are inside a base but not near an
        // energy source
        var closestContainer = false;
        var closestContainerDistance = Infinity;
        var sources = creep.room.find(FIND_SOURCES);
        var helperBase = require('helper.base');

        for (var idxStructure in structures) {
            var structure = structures[idxStructure];

            if (helperBase.isInBase(structure.pos) == true && structure.structureType == STRUCTURE_CONTAINER) {
                if (structure.store [RESOURCE_ENERGY] < structure.storeCapacity) {
                    var isNearSource = false;

                    for (var idxSource = 0; idxSource < sources.length; idxSource++) {
                        var source = sources[idxSource];
                        var pathLength = source.pos.getRangeTo(structure);

                        if (pathLength <= 3) {
                            isNearSource = true;
                        }
                    }

                    if (!isNearSource) {
                        var containerDistance = creep.pos.findPathTo(structure).length;

                        if (closestContainer == false || containerDistance < closestContainerDistance) {
                            closestContainer = structure;
                            closestContainerDistance = containerDistance;
                        }
                    }
                }
            }
        }

        if (closestContainer) {
            return closestContainer;
        }

        // Fourth fill up any towers
        for (var idxStructure = 0; idxStructure < structures.length; idxStructure++) {
            var structure = structures[idxStructure];

            if (structure.structureType == STRUCTURE_TOWER) {
                if (structure.energy < structure.energyCapacity - creep.carry [RESOURCE_ENERGY]) {
                    return structure;
                }
            }
        }

        // Lastly give to the nearest energy spending creep in a friendly room
        var helperProfiles = require('helper.profiles');
        var helperBase = require('helper.base');
        var nearestSpender = false;
        var nearestSpenderDistance = Infinity;

        for (var creepName in Game.creeps) {
            var friendlyCreep = Game.creeps[creepName];
            var profile = helperProfiles.getProfile(friendlyCreep.memory.role);

            if (profile) {
                if (
                    helperBase.isRoomFriendly(friendlyCreep.room)
                    && profile.energyType == 'Spender'
                    && friendlyCreep.carry [RESOURCE_ENERGY] <= (friendlyCreep.carryCapacity / 2)
                ) {
                    var distance = creep.pos.findPathTo(friendlyCreep).length;

                    if (distance < nearestSpenderDistance) {
                        nearestSpender = friendlyCreep;
                        nearestSpenderDistance = distance;
                    }
                }
            }
        }

        if (nearestSpender) {
            creep.memory.depositSiteId = nearestSpender.id;
            return nearestSpender;
        }

        return false;
    },

    getWithdrawSite: function(creep) {
        var withdrawSite = Game.getObjectById(creep.memory.withdrawSiteId);

        if (withdrawSite) {
            if (withdrawSite instanceof Tombstone) {
                if (withdrawSite.store [RESOURCE_ENERGY] > 0) {
                    return withdrawSite;
                }
            } else if (withdrawSite instanceof Resource) {
                if (withdrawSite.amount > 0) {
                    return withdrawSite;
                }
            }
        }

        creep.memory.withdrawSiteId = undefined;

        var mostEnergySite = false;
        var mostEnergy = 0;
        var rooms = Game.rooms;

        for (var roomName in rooms) {
            var room = Game.rooms[roomName];

            var tombstones = room.find(FIND_TOMBSTONES);

            for (var idxTombstone in tombstones) {
                var tombstone = tombstones[idxTombstone];

                if (tombstone.store [RESOURCE_ENERGY] > mostEnergy) {
                    mostEnergySite = tombstone;
                    mostEnergy = tombstone.store [RESOURCE_ENERGY];
                }
            }

            var ignoreResources = false;

            if (room.controller) {
                if (room.controller.owner) {
                    if (room.controller.owner.username !== creep.owner.username) {
                        ignoreResources = true;
                    }
                }

                if (room.controller.reservation) {
                    if (room.controller.reservation.username !== creep.owner.username) {
                        ignoreResources = true;
                    }
                }
            }

            if (!ignoreResources) {
                var resources = room.find(FIND_DROPPED_RESOURCES);

                for (var idxResource in resources) {
                    var resource = resources[idxResource];

                    if (resource.amount > mostEnergy) {
                        mostEnergySite = resource;
                        mostEnergy = resource.amount;
                    }
                }
            }
        }

        if (mostEnergySite) {
            creep.memory.withdrawSiteId = mostEnergySite.id;
            return mostEnergySite;
        }

        return false;
    },

    run: function(creep, helperLocations = undefined) {
        creep.memory.activity = this.getActivity(creep);

        if (creep.memory.activity == 'Deposit') {
            this.doDeposit(creep);
        } else if (creep.memory.activity == 'Scavenge') {
            this.doScavenge(creep);
        }
	}

}

module.exports = roleScavenger;
