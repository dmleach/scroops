class UtilSpawn
{
    constructor(spawnName) {
        this.spawnName = spawnName;

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

    getRoleToSpawn(worldManager) {
        let Role = require('Role');
        let roleClass;
        let spawn = Game.spawns[this.spawnName];

        for (let role of Role) {
            roleClass = Role.getCreepClassByRole(role);

            if (roleClass.canSpawn(spawn.pos.roomName, worldManager, this.utilCreep) && this.utilCreep.countByRole(role) < roleClass.numberToSpawn(worldManager, this.utilCreep)) {
                return role;
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