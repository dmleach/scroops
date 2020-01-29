let creepAncestorClass = require('CreepAncestor');

class creepEarner extends creepAncestorClass
{
    static canSpawn(roomName, worldManager, utilCreep) {
        if (worldManager.isFullEnergy(roomName)) {
            return true;
        }

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

    get mode() {
        let mode = this.MODE_TAKE_ENERGY;
        let load = this.gameObject.store.getUsedCapacity(RESOURCE_ENERGY);
        let capacity = this.gameObject.store.getCapacity(RESOURCE_ENERGY);

        if (load === capacity) {
            mode = this.MODE_GIVE_ENERGY;
        }

        return mode;
    }
}

module.exports = creepEarner;