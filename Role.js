const Role = {
    HARVESTER: 'harvester',
    UPGRADER: 'upgrader',
    WARRIOR: 'warrior',
    BUILDER: 'builder',
    DISTRIBUTOR: 'distributor',
    SCOUT: 'scout',
    IMPORTER: 'importer',
    SCAVENGER: 'scavenger',

    getCreepClassByCreepId: function(creepId) {
        let role = this.getRoleByCreepId(creepId);

        if (role === undefined) {
            return undefined;
        }

        return this.getCreepClassByRole(role);
    },

    getCreepClassByRole: function(role) {
        let roleModule = this.getModuleByRole(role);

        if (roleModule === undefined) {
            return undefined;
        }

        return require(roleModule);
    },

    getModuleByRole: function(role) {
        switch (role) {
            case Role.HARVESTER: return 'CreepHarvester';
            case Role.UPGRADER: return 'CreepUpgrader';
            case Role.WARRIOR: return 'CreepWarrior';
            case Role.BUILDER: return 'CreepBuilder';
            case Role.DISTRIBUTOR: return 'CreepDistributor';
            case Role.SCOUT: return 'CreepScout';
            case Role.IMPORTER: return 'CreepImporter';
            case Role.SCAVENGER: return 'CreepScavenger';
        }

        return undefined;
    },

    getRoleByCreepId: function(creepId) {
        let creep = Game.getObjectById(creepId);

        if (creep === undefined || creep === null) {
            return undefined;
        }

        let creepName = creep.name.toUpperCase();

        for (let role of Role) {
            if (creepName.substr(0, role.length) === role.toUpperCase()) {
                return role;
            }
        }

        return undefined;
    },

    [Symbol.iterator]: function* () {
        yield Role.HARVESTER;
        yield Role.DISTRIBUTOR;
        yield Role.SCAVENGER;
        yield Role.SCOUT;
        yield Role.IMPORTER;
        yield Role.UPGRADER;
        yield Role.WARRIOR;
        yield Role.BUILDER;
    }
};


module.exports = Role;