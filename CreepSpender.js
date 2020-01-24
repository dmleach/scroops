let CreepAncestorClass = require('CreepAncestor');

class CreepSpender extends CreepAncestorClass
{
    static canSpawn(roomManager, utilCreep) {
        return roomManager.isFullEnergy;
    }

    getGiveEnergyTargetId(roomManager) {
        let UtilCreepClass = require('UtilCreep');
        let utilCreep = new UtilCreepClass(Game.creeps);
        let Role = require('Role');

        if (utilCreep.countByRole(Role.DISTRIBUTOR) > 0) {
            return undefined;
        }

        if (roomManager.isFullEnergy === false) {
            for (let idxSpawn = 0; idxSpawn < roomManager.getFriendlySpawns().length; idxSpawn++) {
                if (roomManager.getFriendlySpawns()[idxSpawn].store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    return roomManager.getFriendlySpawns()[idxSpawn].id;
                }
            }

            for (let idxExtension = 0; idxExtension < roomManager.getExtensions().length; idxExtension++) {
                if (roomManager.getExtensions()[idxExtension].store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    return roomManager.getExtensions()[idxExtension].id;
                }
            }
        }

        return undefined;
    }

    getTakeEnergyTargetId(roomManager) {
        this.debug('Finding what I should take energy from');

        let UtilCreepClass = require('UtilCreep');
        let utilCreep = new UtilCreepClass(Game.creeps);
        let Role = require('Role');

        if (this.gameObject.body.indexOf(WORK) !== -1 && utilCreep.countByRole(Role.HARVESTER) === 0) {
            this.debug('The room has no harvester, so I will do it');
            let CreepHarvesterClass = require('CreepHarvester');
            let creep = new CreepHarvesterClass(this.id);
            return creep.getTakeEnergyTargetId(roomManager);
        }

        if (roomManager.isFullEnergy === false && this.canTakeEnergyWhenRoomNotFull === false) {
            this.debug('The spawns and extensions are not full, so I cannot take energy this turn');
            return undefined;
        }

        let closestContainerId = undefined;
        let closestContainerRange = 10000000;
        let container;
        let containerRange;

        for (let idxContainer = 0; idxContainer < roomManager.getContainers().length; idxContainer++) {
            container = roomManager.getContainers()[idxContainer];

            if (container.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                containerRange = container.pos.getRangeTo(this.pos);

                if (closestContainerId === undefined || closestContainerRange > containerRange) {
                    closestContainerId = container.id;
                    closestContainerRange = containerRange;
                }
            }
        }

        if (closestContainerId !== undefined) {
            return closestContainerId;
        }

        // Don't take energy from spawns if the room doesn't have any harvesters
        if (utilCreep.countByRole(Role.HARVESTER) > 0 && roomManager.getContainers().length === 0) {
            for (let idxSpawn = 0; idxSpawn < roomManager.getFriendlySpawns().length; idxSpawn++) {
                if (roomManager.getFriendlySpawns()[idxSpawn].store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                    return roomManager.getFriendlySpawns()[idxSpawn].id;
                }
            }
        }

        return undefined;
    }

    get mode() {
        let mode = this.MODE_TAKE_ENERGY;
        let load = this.gameObject.store.getUsedCapacity(RESOURCE_ENERGY);

        if (load > 0) {
            mode = this.MODE_GIVE_ENERGY;
        }

        return mode;
    }
}

module.exports = CreepSpender;