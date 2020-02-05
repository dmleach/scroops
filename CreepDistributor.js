let CreepSpenderClass = require('CreepSpender');

class CreepDistributor extends CreepSpenderClass
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

    getGiveEnergyTargetId(worldManager, utilCreep) {
        // Distributors should first fill the room's spawn and extensions
        if (worldManager.isFullEnergy(this.roomName) === false) {
            let spawns = worldManager.getFriendlySpawns(this.roomName);

            for (let idxSpawn = 0; idxSpawn <spawns.length; idxSpawn++) {
                if (spawns[idxSpawn].store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    return spawns[idxSpawn].id;
                }
            }

            let extensions = worldManager.getExtensionsByPosition(this.pos);
            let extensionStore;

            for (let idxExtension = 0; idxExtension < extensions.length; idxExtension++) {
                if (extensions[idxExtension] === undefined) {
                    continue;
                }

                if ('store' in extensions[idxExtension] === false) {
                    continue;
                }

                extensionStore = extensions[idxExtension].store;

                if (extensionStore === undefined) {
                    continue;
                }

                if (extensionStore.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    return extensions[idxExtension].id;
                }
            }
        }

        // Next distributors should fill the emptiest tower or non-harvest container
        let emptiestContainerId = undefined;
        let emptiestContainerEnergy = 10000000;
        let container;
        let containerEnergy;

        let containers = worldManager.getContainers(this.roomName);
        let harvestContainers = worldManager.getHarvestContainers(this.roomName);

        for (let idxContainer = 0; idxContainer < containers.length; idxContainer++) {
            container = containers[idxContainer];

            if (harvestContainers.indexOf(container) !== -1) {
                continue;
            }

            containerEnergy = container.store.getUsedCapacity(RESOURCE_ENERGY);

            if (emptiestContainerId === undefined || emptiestContainerEnergy > containerEnergy) {
                emptiestContainerId = container.id;
                emptiestContainerEnergy = containerEnergy;
            }
        }

        let towers = worldManager.getTowers(this.roomName);

        for (let idxTower = 0; idxTower < towers.length; idxTower++) {
            this.debug('Considering tower ' + towers[idxTower]);
            containerEnergy = towers[idxTower].store.getUsedCapacity(RESOURCE_ENERGY);
            this.debug('Tower energy is ' + containerEnergy);

            if (emptiestContainerId === undefined || emptiestContainerEnergy > containerEnergy) {
                emptiestContainerId = towers[idxTower].id;
                emptiestContainerEnergy = containerEnergy;
                this.debug('Emptiest container id is now ' + emptiestContainerId);
            }
        }

        return emptiestContainerId;
    }

    get movePriority() {
        return 90;
    }

    getTakeEnergyTargetId(worldManager) {
        // Distributors should first pull from harvest containers
        let harvestContainers = worldManager.getHarvestContainers(this.roomName);
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
        let containers = worldManager.getContainers(this.roomName);

        for (let idxContainer = 0; idxContainer < containers.length; idxContainer++) {
            containerEnergy = containers[idxContainer].store.getUsedCapacity(RESOURCE_ENERGY);

            if (containerEnergy > 0) {
                if (fullestContainerId === undefined || fullestContainerEnergy < containerEnergy) {
                    fullestContainerId = containers[idxContainer].id;
                    fullestContainerEnergy = containerEnergy;
                }
            }
        }

        if (fullestContainerId !== undefined) {
            return fullestContainerId;
        }

        let resources = worldManager.getDroppedResources(this.roomName);

        if (resources !== undefined && resources[0] !== undefined) {
            return resources[0].id;
        }

        let tombstones = worldManager.getTombstones(this.roomName);

        for (let idxTombstone = 0; idxTombstone < tombstones.length; idxTombstone++) {
            if (tombstones[idxTombstone].store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                return tombstones[idxTombstone].id;
            }
        }
    }

    get isShowingDebugMessages() {
        return false;
    }


}

module.exports = CreepDistributor;