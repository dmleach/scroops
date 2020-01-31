let CreepSpenderClass = require('CreepSpender');

class CreepScavenger extends CreepSpenderClass
{
    static get basicBody() {
        return [CARRY, MOVE];
    }

    static get bodyIncrement() {
        return [CARRY, MOVE];
    }

    static canSpawn(roomName, worldManager, utilCreep) {
        let Role = require('Role');
        let distributorIds = utilCreep.getCreepIdsByRole(Role.DISTRIBUTOR);
        let distributor;

        for (let idxDistributorId = 0; idxDistributorId < distributorIds.length; idxDistributorId++) {
            distributor = utilCreep.getCreep(distributorIds[idxDistributorId]);

            if (distributor.energy > 0) {
                return false;
            }
        }

        return true;
    }

    getGiveEnergyTargetId(worldManager) {
        let Role = require('Role');
        let CreepDistributorClass = Role.getCreepClassByRole(Role.DISTRIBUTOR);
        let creep = new CreepDistributorClass(this.id);
        creep.takeEnergyTargetId = this.takeEnergyTargetId;
        return creep.getGiveEnergyTargetId(worldManager);
    }

    getTakeEnergyTargetId(worldManager) {
        let resources = worldManager.getDroppedResources(this.roomName);

        if (resources !== undefined && resources.length > 0) {
            return resources[0].id;
        }

        let tombstones = worldManager.getTombstones(this.roomName);

        for (let idxTombstone = 0; idxTombstone < tombstones.length; idxTombstone++) {
            if (tombstones[idxTombstone].store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                return tombstones[idxTombstone].id;
            }
        }

        let ruins = worldManager.getRuins(this.roomName);

        for (let idxRuin = 0; idxRuin < ruins.length; idxRuin++) {
            if (ruins[idxRuin].store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                return ruins[idxRuin].id;
            }
        }

        let Role = require('Role');
        let CreepDistributorClass = Role.getCreepClassByRole(Role.DISTRIBUTOR);
        let creep = new CreepDistributorClass(this.id);
        return creep.getTakeEnergyTargetId(worldManager);
    }

    get isShowingDebugMessages() {
        return false;
    }

    get movePriority() {
        return 80;
    }
}

module.exports = CreepScavenger;