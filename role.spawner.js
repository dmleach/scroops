var roleSpawner = {

    removeLeastAdvancedCreep: function(spawn) {
        var leastAdvancedEarnerCreep = false;
        var leastAdvancedEarnerCreepExtraCount = Infinity;
        var leastAdvancedMoverCreep = false;
        var leastAdvancedMoverCreepExtraCount = Infinity;
        var leastAdvancedSpenderCreep = false;
        var leastAdvancedSpenderCreepExtraCount = Infinity;
        var helperProfiles = require('helper.profiles');
        var helperCreeps = require('helper.creeps');

        for (var creepName in Game.creeps) {
            var creep = Game.creeps[creepName];
            var profile = helperProfiles.getProfile(creep.memory.role);

            if (profile.renewable) {
                var body = helperCreeps.bodyParts(creep);
                var potentialBody = profile.body(spawn.room);

                if (body.length < potentialBody.length) {
                    var baseBody = profile.baseBody;
                    var extraCount = body.length - baseBody.length;

                    if (extraCount > 0) {
                        if (profile.energyType == 'Earner' && extraCount < leastAdvancedEarnerCreepExtraCount) {
                            leastAdvancedEarnerCreep = creep;
                            leastAdvancedEarnerCreepExtraCount = extraCount;
                        }

                        if (profile.energyType == 'Mover' && extraCount < leastAdvancedEarnerCreepExtraCount) {
                            leastAdvancedMoverCreep = creep;
                            leastAdvancedMoverCreepExtraCount = extraCount;
                        }

                        if (profile.energyType == 'Spender' && extraCount < leastAdvancedEarnerCreepExtraCount) {
                            leastAdvancedSpenderCreep = creep;
                            leastAdvancedSpenderCreepExtraCount = extraCount;
                        }
                    }
                }
            }
        }

        var creepToUpgrade = false;

        if (leastAdvancedEarnerCreep) {
            creepToUpgrade = leastAdvancedEarnerCreep;
        } else if (leastAdvancedMoverCreep) {
            creepToUpgrade = leastAdvancedMoverCreep;
        } else if (leastAdvancedSpenderCreep) {
            creepToUpgrade = leastAdvancedSpenderCreep;
        }

        if (creepToUpgrade) {
            console.log('Getting rid of ' + creepToUpgrade.name + ' with ' + helperCreeps.bodyParts(creepToUpgrade));
            creepToUpgrade.suicide();
            return true;
        }

        return false;
    },

    replaceMissingCreep: function(spawn, helperLocations = undefined) {
        var helperProfiles = require('helper.profiles');
        var helperCreeps = require('helper.creeps');

        // These creeps are essential and there should always be at least one
        // of each of them. They're ordered by priority
        var essentialCreeps = [helperProfiles.harvester, helperProfiles.distributor, helperProfiles.upgrader, helperProfiles.builder];

        for (var idxCreep in essentialCreeps) {
            if (helperCreeps.count(essentialCreeps[idxCreep]) == 0) {
                this.spawnCreep(spawn, essentialCreeps[idxCreep]);
                return true;
            }
        }

        // Create creeps that earn energy first, then creeps that move energy,
        // then creeps that spend energy
        var energyTypes = ['Earner', 'Mover', 'Spender'];

        for (var idxEnergyType in energyTypes) {
            var energyType = energyTypes[idxEnergyType];

            for (var profileName in helperProfiles) {
                var profile = helperProfiles[profileName];

                if (profile.energyType == energyType && profile.active) {
                    if (helperCreeps.isNeeded(profile, spawn, helperLocations)) {
                        this.spawnCreep(spawn, profile);
                        return true;
                    }
                }
            }
        }

        return false;
    },

    /**
      * @param {StructureSpawn} spawn
      * @param {bool} debug
     **/
    run: function(spawn, helperLocations = undefined) {
        if (this.replaceMissingCreep(spawn, helperLocations)) {
            return true;
        }

        // If no creeps are missing and the room is at full energy capacity,
        // automatically replace the oldest existing creep
        if (spawn.room.energyAvailable == spawn.room.energyCapacityAvailable) {
            if (this.removeLeastAdvancedCreep(spawn)) {
                if (this.replaceMissingCreep(spawn, helperLocations)) {
                    return true;
                }
            }
        }
	},

    spawnCreep: function(spawn, profile) {
        var body = profile.body(spawn.room);
        var spawnResult = spawn.spawnCreep(
            body,
            profile.creepName + Game.time.toString(),
            { memory: { role: profile.creepType} }
        );

        if (spawnResult == OK) {
            console.log('Spawned a new ' + profile.creepName + ' with body ' + body);
            return true;
        } else if (spawnResult == ERR_BUSY) {
            return true;
        }
    },
};

module.exports = roleSpawner;
