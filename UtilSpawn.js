class UtilSpawn
{
    constructor(spawnName) {
        this.spawnName = spawnName;

        let UtilCreepClass = require('UtilCreep');
    }

    static getCostByBody(body) {
        let cost = 0;

        body.forEach(function(bodyPart) {
            cost += BODYPART_COST[bodyPart];
        });

        return cost;
    }

    getRoleToSpawn(worldManager, utilCreep) {
        let spawn = Game.spawns[this.spawnName];

        let Role = require('Role');
        let roles = [];

        for (let role of Role) {
            roles.push(role);
        }

        let roleClass;

        for (let idxRole = 0; idxRole < roles.length; idxRole++) {
            roleClass = Role.getCreepClassByRole(roles[idxRole]);

            if (utilCreep.countByRole(roles[idxRole]) >= roleClass.numberToSpawn(worldManager, utilCreep)) {
                continue;
            }

            if (roleClass.canSpawn(spawn.pos.roomName, worldManager, utilCreep)) {
                return roles[idxRole];
            }
        }

        return undefined;
    }

    spawnCreep(worldManager, utilCreep) {
        if (worldManager === undefined) {
            return;
        }

        let roleToSpawn = this.getRoleToSpawn(worldManager, utilCreep);

        if (roleToSpawn === undefined) {
            return;
        }

        let Role = require('Role');
        let roleClass = require(Role.getModuleByRole(roleToSpawn));
        console.log('UtilSpawn spawn name is ' + this.spawnName);
        let spawn = Game.spawns[this.spawnName];
        spawn.spawnCreep(roleClass.getBodyByEnergy(worldManager.getEnergyAvailable(spawn.pos.roomName)), roleToSpawn + Game.time.toString());
    }
}

module.exports = UtilSpawn;