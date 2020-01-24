class UtilSpawn
{
    constructor(roomName) {
        this.roomName = roomName;

        let UtilCreepClass = require('UtilCreep');
        this.utilCreep = new UtilCreepClass(Game.creeps);
    }

    static getCostByBody(body) {
        let cost = 0;

        body.forEach(function(bodyPart) {
            cost += BODYPART_COST[bodyPart];
        });

        return cost;
    }

    getRoleToSpawn(roomManager, utilCreep) {
        let Role = require('Role');
        let roleClass;

        for (let role of Role) {
            roleClass = Role.getCreepClassByRole(role);

            if (roleClass.canSpawn(roomManager, utilCreep) && this.utilCreep.countByRole(role) < roleClass.numberToSpawn(this.utilCreep)) {
                return role;
            }
        }

        return undefined;
    }

    spawnCreep(roomManager, utilCreep) {
        if (roomManager === undefined) {
            return;
        }

        let roleToSpawn = this.getRoleToSpawn(roomManager, utilCreep);

        if (roleToSpawn === undefined) {
            return;
        }

        let Role = require('Role');
        let roleClass = require(Role.getModuleByRole(roleToSpawn));
        let spawn = roomManager.getFriendlySpawns()[0];
        spawn.spawnCreep(roleClass.getBodyByEnergy(roomManager.energyAvailable), roleToSpawn + Game.time.toString());
    }
}

module.exports = UtilSpawn;