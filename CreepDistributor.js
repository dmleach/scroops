let CreepSpenderClass = require('CreepSpender');

class CreepDistributor extends CreepSpenderClass
{
    static get basicBody() {
        return [CARRY, MOVE];
    }

    static get bodyIncrement() {
        return [CARRY, MOVE];
    }

    static canSpawn(roomManager, utilCreep) {
        let Role = require('Role');
        let distributorIds = utilCreep.getCreepIdsByRole(Role.DISTRIBUTOR);
        let distributor;

        for (let idxDistributorId = 0; idxDistributorId < distributorIds.length; idxDistributorId++) {
            distributor = utilCreep.getCreep(distributorIds[idxDistributorId]);

            if (distributor.energyAvailable > 0) {
                return false;
            }
        }

        return true;
    }

    getGiveEnergyTargetId(roomManager) {
        // Distributors should first fill the room's spawn and extensions
        if (roomManager.isFullEnergy === false) {
            for (let idxSpawn = 0; idxSpawn < roomManager.getFriendlySpawns().length; idxSpawn++) {
                if (roomManager.getFriendlySpawns()[idxSpawn].store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    return roomManager.getFriendlySpawns()[idxSpawn].id;
                }
            }

            let extensions = roomManager.getExtensionsByPosition(this.pos);

            for (let idxExtension = 0; idxExtension < extensions.length; idxExtension++) {
                if ( ('store' in extensions[idxExtension]) === false) {
                    continue;
                }

                if (extensions[idxExtension].store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    return extensions[idxExtension].id;
                }
            }
        }

        // Next distributors should fill the emptiest tower or non-harvest container
        let emptiestContainerId = undefined;
        let emptiestContainerEnergy = 10000000;
        let container;
        let containerEnergy;
        let harvestContainers = roomManager.getHarvestContainers();

        for (let idxContainer = 0; idxContainer < roomManager.getContainers().length; idxContainer++) {
            container = roomManager.getContainers()[idxContainer];

            if (harvestContainers.indexOf(container) !== -1) {
                continue;
            }

            containerEnergy = container.store.getUsedCapacity(RESOURCE_ENERGY);

            if (emptiestContainerId === undefined || emptiestContainerEnergy > containerEnergy) {
                emptiestContainerId = container.id;
                emptiestContainerEnergy = containerEnergy;
            }
        }

        for (let idxTower = 0; idxTower < roomManager.getTowers().length; idxTower++) {
            this.debug('Considering tower ' + roomManager.getTowers()[idxTower]);
            containerEnergy = roomManager.getTowers()[idxTower].store.getUsedCapacity(RESOURCE_ENERGY);
            this.debug('Tower energy is ' + containerEnergy);

            if (emptiestContainerId === undefined || emptiestContainerEnergy > containerEnergy) {
                emptiestContainerId = roomManager.getTowers()[idxTower].id;
                emptiestContainerEnergy = containerEnergy;
                this.debug('Emptiest container id is now ' + emptiestContainerId);
            }
        }

        return emptiestContainerId;
    }

    get movePriority() {
        return 90;
    }

    getTakeEnergyTargetId(roomManager) {
        // Distributors should first pull from harvest containers
        let harvestContainers = roomManager.getHarvestContainers();
        let container;

        for (let idxContainer = 0; idxContainer < harvestContainers.length; idxContainer++) {
            container = harvestContainers[idxContainer];
            this.debug('Examining harvest container ' + container.id);

            if (container.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                return container.id;
            }
        }

        let fullestContainerId = undefined;
        let fullestContainerEnergy = 0;
        let containerEnergy;

        for (let idxContainer = 0; idxContainer < roomManager.getContainers().length; idxContainer++) {
            containerEnergy = roomManager.getContainers()[idxContainer].store.getUsedCapacity(RESOURCE_ENERGY);

            if (containerEnergy > 0) {
                if (fullestContainerId === undefined || fullestContainerEnergy < containerEnergy) {
                    fullestContainerId = roomManager.getContainers()[idxContainer].id;
                    fullestContainerEnergy = containerEnergy;
                }
            }
        }

        return fullestContainerId;
    }

    get isShowingDebugMessages() {
        return false;
    }


}

module.exports = CreepDistributor;