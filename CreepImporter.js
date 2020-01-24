let CreepHarvesterClass = require('CreepHarvester');

class CreepImporter extends CreepHarvesterClass
{
    static get basicBody() {
        return [WORK, MOVE, CARRY, MOVE];
    }

    static get bodyIncrement() {
        return [WORK, MOVE, CARRY, MOVE];
    }

    getGiveEnergyTargetId(roomManager) {
        // if (this.mode === this.MODE_TAKE_ENERGY) {
        //     return undefined;
        // }

        let containers = roomManager.getContainers();

        if (containers !== undefined && containers.length > 0) {
            return containers[0].id;
        }

        let spawns = roomManager.getFriendlySpawns();

        if (spawns !== undefined && spawns.length > 0) {
            return spawns[0].id;
        }

        let extensions = roomManager.getExtensions();

        if (extensions !== undefined && extensions.length > 0) {
            return extensions[0].id;
        }

        let towers = roomManager.getTowers();

        if (towers !== undefined && towers.length > 0) {
            return towers[0].id;
        }

        return undefined;
    }

    getTakeEnergyTargetId(roomManager) {
        if (this.mode === this.MODE_GIVE_ENERGY) {
            return undefined;
        }

        let roomSources;

        for (let visibleRoomName in Game.rooms) {
            if (Game.rooms[visibleRoomName].controller.my) {
                continue;
            }

            roomSources = Game.rooms[visibleRoomName].find(FIND_SOURCES);

            if (roomSources !== undefined && roomSources.length > 0) {
                return roomSources[0].id;
            }
        }

        return undefined;
    }

    get isShowingDebugMessages() {
        return this.name === 'importer14915164';
    }

    static numberToSpawn(utilCreep) {
        let Role = require('Role');
        return utilCreep.countByRole(Role.SCOUT) * 2;
    }
}

module.exports = CreepImporter;