class UtilCreep
{
    constructor(creeps) {
        this.creepIds = this.getCreepIds(creeps);
    }

    get count() {
        return (this.creepIds === undefined) ? undefined : this.creepIds.length;
    }

    countByRole(role) {
        let roleCount = 0;
        let Role = require('Role');

        this.creepIds.forEach(function(creepId) {
            if (Role.getRoleByCreepId(creepId) === role) {
                roleCount++;
            }
        });

        return roleCount;
    }

    getCreep(id) {
        let Role = require('Role');
        let CreepClass = Role.getCreepClassByCreepId(id);
        return new CreepClass(id);
    }

    getCreepIds(creeps) {
        let creepNames = [];

        for (let creepName in creeps) {
            creepNames.push(creepName);
        };

        let creepIds = [];

        creepNames.forEach(function(creepName) {
            let creep = creeps[creepName];
            creepIds.push(creep.id);
        });

        return creepIds;
    }

    getCreepIdsByRole(role) {
        let creepsOfRole = [];
        let Role = require('Role');

        this.creepIds.forEach(function(creepId) {
            if (Role.getRoleByCreepId(creepId) === role) {
                creepsOfRole.push(creepId);
            }
        });

        return creepsOfRole;
    }

    getCreepIdsInMoveOrder(creeps) {

    }


}

module.exports = UtilCreep;