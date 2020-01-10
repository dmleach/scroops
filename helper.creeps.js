var helperCreeps = {

    bodyParts: function(creep) {
        var body = [];

        for (var idxBody in creep.body) {
            body.push(creep.body[idxBody].type);
        }

        return body;
    },

    bodyPartCost: function(bodyParts) {
        var cost = 0;

        for (var idxPart = 0; idxPart < bodyParts.length; idxPart++) {
            cost += BODYPART_COST[bodyParts[idxPart]];
        }

        return cost;
    },

    cleanupCreepMemory: function() {
        for (var creepName in Memory.creeps) {
            if (!Game.creeps[creepName]) {
                delete Memory.creeps[creepName];
            }
        }
    },

    count: function(profile = false) {
        return this.find(profile).length;
    },

    find: function(profile = false) {
        var matchingCreeps = [];

        for (var creepName in Game.creeps) {
            var creep = Game.creeps[creepName];

            if (!profile) {
                matchingCreeps.push(creep);
            } else if (creep.memory.role == profile.creepType) {
                matchingCreeps.push(creep);
            }
        }

        return matchingCreeps;
    },

    isHostile: function(creep) {
        var isHostile = false;

        for (var idxBody in creep.body) {
            var bodyPart = creep.body[idxBody];

            if ([ATTACK, RANGED_ATTACK, CLAIM].indexOf(bodyPart.type) > -1) {
                isHostile = true;
            }
        }

        return isHostile;
    },

    isNeeded: function(profile, spawn, helperLocations = undefined) {
        if (profile.shouldSpawn !== undefined) {
            return profile.shouldSpawn(spawn, helperLocations);
        }

        if (profile.desiredCount !== undefined) {
            return this.count(profile) < profile.desiredCount;
        }

        return false;
    },


}

module.exports = helperCreeps;
