let CreepHarvesterClass = require('CreepHarvester');

class CreepImporter extends CreepHarvesterClass
{
    static get basicBody() {
        return [WORK, MOVE, CARRY, MOVE];
    }

    static get bodyIncrement() {
        return [WORK, MOVE, CARRY, MOVE];
    }

    getGiveEnergyTargetId(worldManager) {
        for (let visibleRoomName in Game.rooms) {
            this.debug('Looking for object to give energy to in room ' + visibleRoomName);

            if (Game.rooms[visibleRoomName].controller.my === false) {
                this.debug('My player does not control ' + visibleRoomName + ', so dismissing this room');
                continue;
            }

            let containers = worldManager.getContainers(visibleRoomName);

            for (let idxContainer = 0; idxContainer < containers.length; idxContainer++) {
                this.debug('Examining ' + containers[idxContainer]);

                if (containers[idxContainer].store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    return containers[idxContainer].id;
                }
            }

            let spawns = worldManager.getFriendlySpawns(visibleRoomName);

            for (let idxSpawn = 0; idxSpawn < spawns.length; idxSpawn++) {
                this.debug('Examining ' + spawns[idxSpawn] + ', with free capacity ' + spawns[idxSpawn].store.getFreeCapacity(RESOURCE_ENERGY));

                if (spawns[idxSpawn].store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    return spawns[idxSpawn].id;
                }
            }

            let extensions = worldManager.getExtensions(visibleRoomName);

            for (let idxExtension = 0; idxExtension < extensions.length; idxExtension++) {
                if (extensions[idxExtension].store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    return extensions[idxExtension].id;
                }
            }

            let towers = worldManager.getTowers(visibleRoomName);

            for (let idxTower = 0; idxTower < towers.length; idxTower++) {
                if (towers[idxTower].store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    return towers[idxTower].id;
                }
            }
        }

        return undefined;
    }

    getTakeEnergyTargetId(worldManager) {
        if (this.mode === this.MODE_GIVE_ENERGY) {
            return undefined;
        }

        let roomSources;

        for (let visibleRoomName in Game.rooms) {
            if (Game.rooms[visibleRoomName].controller.my) {
                continue;
            }

            roomSources = worldManager.getSources(visibleRoomName);

            if (roomSources !== undefined && roomSources.length > 0) {
                return roomSources[0].id;
            }
        }

        return undefined;
    }

    get isShowingDebugMessages() {
        return this.name === 'foo';
    }

    get mode() {
        let mode = this.MODE_TAKE_ENERGY;

        if (this.full) {
            mode = this.MODE_GIVE_ENERGY;
        }

        if (Game.rooms[this.roomName].controller.my && this.energy > 0) {
            mode = this.MODE_GIVE_ENERGY;
        }

        return mode;
    }

    static numberToSpawn(worldManager, utilCreep) {
        let Role = require('Role');
        return utilCreep.countByRole(Role.SCOUT) * 2;
    }
}

module.exports = CreepImporter;