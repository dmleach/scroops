var roleBuilder = {

    doBuild: function(creep, helperLocations) {
        // Get the construction site this builder should work on, either from
        // cached memory or calculation
        var site = this.getBuildSite(creep, helperLocations);

        // Exit the function if there's nothing to work on
        if (site == false) {
            return false;
        }

        // If the builder isn't within range of the site, move to it
        if (creep.pos.getRangeTo(site.pos) > 3) {
            creep.moveTo(site);
            return true;
        }

        // If the builder is within range of the site, work on it
        if (creep.pos.getRangeTo(site.pos) <= 3) {
            var buildResult = creep.build(site);

            // This is a failsafe just in case the other move doesn't get the
            // builder close enough
            if (buildResult == ERR_NOT_IN_RANGE) {
                creep.moveTo(site);
            }
        }
    },

    doRepair: function(creep, helperLocations) {
        // Find the friendly structure with the lowest amount of hit points
        var leastStructure = false;

        for (var idxStructure in helperLocations.getStructures()) {
            var structure = helperLocations.getStructures()[idxStructure];

            if (structure.my && structure.hits < structure.hitsMax) {
                if (leastStructure === false || structure.hits < leastStructure.hits) {
                    leastStructure = structure;
                }
            }
        }

        if (creep.repair(leastStructure) == ERR_NOT_IN_RANGE) {
            creep.moveTo(leastStructure);
        }
    },

    /** @param {Creep} creep **/
    doWithdraw: function(creep, helperLocations) {
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
    getActivity: function(creep, helperLocations) {
        helperCreeps = require('helper.creeps');

        if (creep.carry.energy == 0) {
            return 'Withdraw';
        }

        var site = this.getBuildSite(creep, helperLocations);

        if (site) {
            return 'Build';
        }

        // Towers are more efficient at repair, so let them do it if they exist
        var helperStructures = require('helper.structures');
        var towers = helperStructures.getStructures(creep.room, STRUCTURE_TOWER);

        if (towers.length == 0) {
            return 'Repair';
        }

        return false;
    },

    getBuildSite: function(creep, helperLocations) {
        var debugCreeps = [Game.creeps['Builder14539691']];

        // If a build site has been cached, use it
        var buildSite = helperLocations.getBuildSiteById(creep.memory.buildSiteId);

        if (buildSite) {
            return buildSite;
        }

        creep.memory.buildSiteId = undefined;

        var functionIsBuildSite = function(buildLocation) {
            return helperLocations.isValidBuildLocation(buildLocation);
        }

        var buildLocation = helperLocations.getClosestBuildLocation(creep.pos, functionIsBuildSite);

        if (buildLocation) {
            if (debugCreeps.indexOf(creep) !== -1) {
                console.log(creep.name + ' decided on ' + buildLocation.description + ' as a build location');
            }

            creep.memory.buildSiteId = buildLocation.id;
            return Game.getObjectById(buildLocation.id)
        }

        if (debugCreeps.indexOf(creep) !== -1) {
            console.log(creep.name + ' could not decide on a build location');
        }

        return false;
    },

    getRepairSite: function(creep, helperLocations) {
        // If a repair site has been cached, use it
        var repairSite = helperLocations.get
    },

    getWithdrawSite: function(creep, helperLocations) {
        var debugCreeps = [Game.creeps['Builder25439500']];

        // If a withdraw site has been cached, use it
        var withdrawSite = helperLocations.getWithdrawSiteById(creep.memory.withdrawSiteId);

        if (withdrawSite) {
            return withdrawSite;
        }

        creep.memory.withdrawSiteId = undefined;

        var functionConsole = function(location) {
            if (debugCreeps.indexOf(creep) !== -1) {
                console.log('Considering ' + location.description + ' as a withdraw location');
            }

            return true;
        }

        var withdrawLocation = helperLocations.getClosestWithdrawLocation(creep.pos, functionConsole);

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
        creep.memory.activity = this.getActivity(creep, helperLocations);

        if (creep.memory.activity == 'Build') {
            this.doBuild(creep, helperLocations);
        } else if (creep.memory.activity == 'Repair') {
            this.doRepair(creep, helperLocations);
        } else if (creep.memory.activity == 'Withdraw') {
            this.doWithdraw(creep, helperLocations);
        }
	}
};

module.exports = roleBuilder;
