var roleDistributor = {

    /** @param {Creep} creep **/
    doDeposit: function(creep, helperLocations) {
        var depositSite = this.getDepositSite(creep, helperLocations);

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
            case ERR_NOT_IN_RANGE:
                creep.moveTo(depositSite);
                break;
            case ERR_FULL:
                creep.memory.depositSiteId = undefined;
                break;
        }
    },

    /** @param {Creep} creep **/
    doHarvest: function(creep) {
        var roleHarvester = require('role.harvester');
        roleHarvester.run(creep);
    },

    /** @param {Creep} creep **/
    doWithdraw: function(creep, helperLocations) {
        var withdrawSite = this.getWithdrawSite(creep, helperLocations);

        if (!withdrawSite) {
            return false;
        }

        if (creep.pos.getRangeTo(withdrawSite.pos) > 1) {
            creep.moveTo(withdrawSite);
            return;
        }

        var withdrawResult = false;

        if (withdrawSite instanceof Resource) {
            withdrawResult = creep.pickup(withdrawSite);
        } else {
            withdrawResult = creep.withdraw(withdrawSite, RESOURCE_ENERGY);
        }

        switch (withdrawResult) {
            case OK:
                creep.memory.withdrawSiteId = undefined;
                break;
            case ERR_NOT_IN_RANGE:
                creep.moveTo(withdrawSite);
                break;
        }
    },

    /** @param {Creep} creep **/
    getActivity: function(creep) {
        helperCreeps = require('helper.creeps');
        profiles = require('helper.profiles');

        if (helperCreeps.count(profiles.harvester) == 0) {
            return 'Harvest';
        }

        if (creep.carry.energy == 0) {
            return 'Withdraw';
        }

        return 'Deposit';
    },

    getDepositSite: function(creep, helperLocations) {
        var debugCreeps = [Game.creeps['Distributor14538077']];

        // If a deposit site has been cached, use it
        var depositSite = helperLocations.getDepositSiteById(creep.memory.depositSiteId);

        if (depositSite) {
            return depositSite;
        }

        creep.memory.depositSiteId = undefined;

        // First fill up the spawns
        if (debugCreeps.indexOf(creep) !== -1) {
            console.log(creep.name + ' is considering spawns as deposit locations');
        }

        var functionIsSpawn = function(depositLocation) {
            return depositLocation.type == 'Spawn'
                && helperLocations.isValidDepositLocation(depositLocation);
        }

        var depositSpawn = helperLocations.getClosestDepositLocation(creep.pos, functionIsSpawn);

        if (depositSpawn) {
            if (debugCreeps.indexOf(creep) !== -1) {
                console.log(creep.name + ' decided on ' + depositSpawn.description + ' as a deposit location');
            }

            creep.memory.depositSiteId = depositSpawn.id;
            return depositSpawn.spawn;
        }

        // Give the towers some energy, but only if they're empty
        if (debugCreeps.indexOf(creep) !== -1) {
            console.log(creep.name + ' is considering empty towers as deposit locations');
        }

        var functionIsEmptyTower = function(depositLocation) {
            depositObject = Game.getObjectById(depositLocation.id);

            if (!(depositObject instanceof StructureTower)) {
                return false;
            }

            return helperLocations.isValidDepositLocation(depositLocation)
                && depositObject.energy < 50;
        }

        var depositTower = helperLocations.getClosestDepositLocation(creep.pos, functionIsEmptyTower);

        if (depositTower) {
            if (debugCreeps.indexOf(creep) !== -1) {
                console.log(creep.name + ' decided on ' + depositTower.description + ' as a deposit location');
            }

            creep.memory.depositSiteId = depositTower.id;
            return depositTower.structure;
        }

        // Fill up the extensions
        if (debugCreeps.indexOf(creep) !== -1) {
            console.log(creep.name + ' is considering extensions as deposit locations');
        }

        var functionIsExtension = function(depositLocation) {
            if (debugCreeps.indexOf(creep) !== -1) {
                console.log(creep.name + ' sees ' + depositLocation.description + ' type is ' + depositLocation.type);
                console.log(creep.name + ' sees ' + depositLocation.description + ' is valid deposit location: ' + helperLocations.isValidDepositLocation(depositLocation));
            }

            return depositLocation.type == 'Extension'
                && helperLocations.isValidDepositLocation(depositLocation, debugCreeps.indexOf(creep) !== -1);
        }

        var depositExtension = helperLocations.getClosestDepositLocation(creep.pos, functionIsExtension);

        if (depositExtension) {
            if (debugCreeps.indexOf(creep) !== -1) {
                console.log(creep.name + ' decided on ' + depositExtension.description + ' as a deposit location');
            }

            creep.memory.depositSiteId = depositExtension.id;
            return depositExtension.structure;
        }

        // Fill up towers
        if (debugCreeps.indexOf(creep) !== -1) {
            console.log(creep.name + ' is considering all towers as deposit locations');
        }

        var functionIsEmptyTower = function(depositLocation) {
            depositObject = Game.getObjectById(depositLocation.id);

            if (!(depositObject instanceof StructureTower)) {
                return false;
            }

            return helperLocations.isValidDepositLocation(depositLocation)
                && depositObject.energy < depositObject.energyCapacity * 0.9;
        }

        var depositTower = helperLocations.getClosestDepositLocation(creep.pos, functionIsEmptyTower);

        if (depositTower) {
            if (debugCreeps.indexOf(creep) !== -1) {
                console.log(creep.name + ' decided on ' + depositTower.description + ' as a deposit location');
            }

            creep.memory.depositSiteId = depositTower.id;
            return depositTower.structure;
        }

        // Fill up containers that are in a base but not near an energy source
        if (debugCreeps.indexOf(creep) !== -1) {
            console.log(creep.name + ' is considering base containers as deposit locations');
        }

        var functionIsBaseNonSourceContainer = function(depositLocation) {
            return depositLocation.type == 'Container'
                && depositLocation.isInBase
                && depositLocation.isNearSource == false
                && helperLocations.isValidDepositLocation(depositLocation);
        }

        var depositContainer = helperLocations.getClosestDepositLocation(creep.pos, functionIsBaseNonSourceContainer);

        if (depositContainer) {
            if (debugCreeps.indexOf(creep) !== -1) {
                console.log(creep.name + ' decided on ' + depositContainer.description + ' as a deposit location');
            }

            creep.memory.depositSiteId = depositContainer.id;
            return depositContainer.structure;
        }

        // // Lastly give to the nearest energy spending creep in a friendly room
        // var helperProfiles = require('helper.profiles');
        // var helperBase = require('helper.base');
        // var nearestSpender = false;
        // var nearestSpenderDistance = Infinity;
        //
        // for (var creepName in Game.creeps) {
        //     var friendlyCreep = Game.creeps[creepName];
        //     var profile = helperProfiles.getProfile(friendlyCreep.memory.role);
        //
        //     if (profile) {
        //         if (
        //             helperBase.isRoomFriendly(friendlyCreep.room)
        //             && profile.energyType == 'Spender'
        //             && friendlyCreep.carry [RESOURCE_ENERGY] <= (friendlyCreep.carryCapacity / 2)
        //         ) {
        //             var distance = creep.pos.findPathTo(friendlyCreep).length;
        //
        //             if (distance < nearestSpenderDistance) {
        //                 nearestSpender = friendlyCreep;
        //                 nearestSpenderDistance = distance;
        //             }
        //         }
        //     }
        // }
        //
        // if (nearestSpender) {
        //     creep.memory.depositSiteId = nearestSpender.id;
        //     return nearestSpender;
        // }

        if (debugCreeps.indexOf(creep) !== -1) {
            console.log(creep.name + ' could not decide on a deposit location');
        }

        return false;
    },

    getWithdrawSite: function(creep, helperLocations) {
        var debugCreeps = [Game.creeps['Distributor14538077']];

        // If a withdraw site has been cached, use it
        var withdrawSite = helperLocations.getWithdrawSiteById(creep.memory.withdrawSiteId);

        if (withdrawSite) {
            return withdrawSite;
        }

        creep.memory.withdrawSiteId = undefined;

        var withdrawLocation = helperLocations.getFullestWithdrawLocation();

        if (withdrawLocation) {
            if (debugCreeps.indexOf(creep) !== -1) {
                console.log(creep.name + ' decided on ' + withdrawLocation.description + ' as a withdraw location');
            }

            creep.memory.withdrawSiteId = withdrawLocation.id;
            return Game.getObjectById(withdrawLocation.id)
        }

        if (debugCreeps.indexOf(creep) !== -1) {
            console.log(creep.name + ' could not decide on a withdraw location');
        }

        return false;
    },

    /** @param {Creep} creep **/
    run: function(creep, helperLocations = undefined) {
        creep.memory.activity = this.getActivity(creep);

        if (creep.memory.activity == 'Deposit') {
            this.doDeposit(creep, helperLocations);
        } else if (creep.memory.activity == 'Harvest') {
            this.doHarvest(creep);
        } else if (creep.memory.activity == 'Withdraw') {
            this.doWithdraw(creep, helperLocations);
        }
	},

}

module.exports = roleDistributor;
