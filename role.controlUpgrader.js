var roleControlUpgrader = {

    /** @param {Creep} creep **/
    doHarvest: function(creep) {
        var roleHarvester = require('role.harvester');
        roleHarvester.run(creep);
    },

    /** @param {Creep} creep **/
    doUpgrade: function(creep, helperLocations) {
        var controlSite = this.getControlSite(creep, helperLocations);

        if (creep.pos.getRangeTo(controlSite) > 3) {
            var moveResult = creep.moveTo(controlSite);

            switch (moveResult) {
                case ERR_NO_PATH:
                    creep.memory.controlSiteId = undefined;
                    break;
            }
        }

        var resultCode = creep.upgradeController(controlSite);

        switch (resultCode) {
            case OK:
                return true;
            case ERR_NOT_IN_RANGE:
                creep.moveTo(controlSite);
                break;
        }


        // // If there's a cached path, use it
        // if (creep.memory.path) {
        //     var path = Room.deserializePath(creep.memory.path);
        //     creep.moveByPath(path);
        //     return;
        // }
        //
        // if (creep.room.controller) {
        //     var helperPath = require('helper.path');
        //     var path = helperPath.findPath(creep.pos, creep.room.controller.pos);
        //
        //     if (path) {
        //         creep.memory.path = Room.serializePath(path);
        //         return;
        //     }
        // }

        // // If the upgrader just changed rooms, reevaluate path
        // var helperExit = require('helper.exit');
        //
        // if (helperExit.isExit(creep.pos)) {
        //     if (!creep.room.controller) {
        //         creep.moveTo(Game.spawns['Spawn1']);
        //         return;
        //     }
        //
        //     var path = creep.pos.findPathTo(creep.room.controller);
        //     creep.memory.path = Room.serializePath(path);
        //     console.log(creep.name + ' path is ' + creep.memory.path);
        //     return;
        // }
        //
        // // If there's a cached path, use it
        // if (creep.memory.path) {
        //     var path = Room.deserializePath(creep.memory.path);
        //     creep.moveByPath(path);
        //     return;
        // }
        //
        // if (creep.pos.getRangeTo(creep.room.controller) <= 3) {
        //     var upgradeResult = creep.upgradeController(creep.room.controller);
        //     return;
        // }
        //
        // var path = creep.pos.findPathTo(creep.room.controller);
        // creep.memory.path = Room.serializePath(path);
        // console.log(creep.name + ' path is ' + creep.memory.path);



        // // Find all walkable squares within three of the controller
        // var helperObstacles = require('helper.obstacles');
        // var positions = helperObstacles.getWalkableSpacesInRange(creep.room.controller.pos, 3);
        //
        // if (positions.length == 0) {
        //     return false;
        // }
        //
        // var locations = [];
        //
        // for (var idxPosition in positions) {
        //     locations.push({ pos: positions[idxPosition] });
        // }
        //
        // helperLocations.sortLocationsByDistance(locations, creep.pos);
        //
        // console.log(creep.name + ' wants to move to ' + locations[0].pos);
        //
        // if (creep.pos.getRangeTo(locations[0]) > 3) {
        //     creep.moveTo(locations[0]);
        //     return;
        // }
        //
        // if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        //     creep.moveTo(creep.room.controller);
        // }
    },

    /** @param {Creep} creep **/
    doWithdraw: function(creep, helperLocations) {
        // If another creep is bringing this one energy, don't do anything
        for (var creepName in Game.creeps) {
            var deliveryCreep = Game.creeps[creepName];

            if (deliveryCreep.memory.depositSiteId) {
                if (deliveryCreep.memory.depositSiteId == creep.id) {
                    return;
                }
            }
        }

        var withdrawalSite = this.getWithdrawSite(creep, helperLocations);

        if (creep.pos.getRangeTo(withdrawalSite) > 1) {
            creep.moveTo(withdrawalSite);
        }

        if (withdrawalSite instanceof StructureContainer) {
            var withdrawResult = creep.withdraw(withdrawalSite, RESOURCE_ENERGY);

            switch (withdrawResult) {
                case OK:
                    creep.memory.withdrawSiteId = undefined;
                    break;
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(withdrawalSite);
                    break;
            }

            return;
        }

        if (withdrawalSite instanceof Resource) {
            var pickupResult = creep.pickup(withdrawalSite);

            switch (pickupResult) {
                case OK:
                    creep.memory.withdrawSiteId = undefined;
                    break;
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(withdrawalSite);
                    break;
            }

            return;
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

        return 'Upgrade';
    },

    getControlSite: function(creep, helperLocations) {
        var helperBase = require('helper.base');

        if (creep.memory.controlSiteId) {
            var controller = Game.getObjectById(creep.memory.controlSiteId);

            if (controller instanceof StructureController && helperBase.isInBase(controller).pos) {
                return controller;
            }
        }

        for (var idxStructure in helperLocations.getStructures()) {
            var structure = helperLocations.getStructures()[idxStructure];

            if (structure instanceof StructureController) {
                if (helperBase.isInBase(structure.pos)) {
                    creep.memory.controlSiteId = structure.id;
                    return structure;
                }
            }
        }

        return false;
    },

    getWithdrawSite: function(creep, helperLocations) {
        var debugCreeps = []; //[Game.creeps['Distributor5678916']];

        // If a withdraw site has been cached, use it
        var withdrawSite = helperLocations.getWithdrawSiteById(creep.memory.withdrawSiteId);

        if (withdrawSite) {
            return withdrawSite;
        }

        creep.memory.withdrawSiteId = undefined;

        if (!creep.room.controller) {
            return false;
        }

        var functionIsValidWithdrawLocation = function(withdrawLocation) {
            return helperLocations.isValidWithdrawLocation(withdrawLocation);
        }

        var withdrawLocation = helperLocations.getClosestWithdrawLocation(creep.room.controller.pos, functionIsValidWithdrawLocation);

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

        if (creep.memory.activity == 'Harvest') {
            this.doHarvest(creep);
        } else if (creep.memory.activity == 'Upgrade') {
            this.doUpgrade(creep, helperLocations);
        } else if (creep.memory.activity == 'Withdraw') {
            this.doWithdraw(creep, helperLocations);
        }
	},
};

module.exports = roleControlUpgrader;
