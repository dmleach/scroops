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

        let cachedId = this.readFromCache(this.KEY_TAKE_ENERGY_TARGET_ID);
        this.debug('Read cached take energy target id ' + cachedId);
        let gameObject = Game.getObjectById(cachedId);

        if (this.validateSource(gameObject)) {
            this.debug('Returning take energy target id ' + cachedId + ' from cache');
            return cachedId;
        }

        let roomSources;

        for (let visibleRoomName in Game.rooms) {
            roomSources = worldManager.getSources(visibleRoomName);

            for (let idxSource = 0; idxSource < roomSources.length; idxSource++) {
                if (this.validateSource(roomSources[idxSource])) {
                    return roomSources[idxSource].id;
                }
            }
        }

        return undefined;
    }

    get isShowingDebugMessages() {
        return this.name === 'foo';
    }

    get isUsingUpdateTakeEnergyFunction() {
        return false;
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
        return utilCreep.countByRole(Role.SCOUT);
    }

    validateSource(source) {
        this.debug('Validating source ' + source);

        if (source instanceof Source === false) {
            this.debug('Invalid because ' + source + ' is not a source');
            return false;
        }

        let room = Game.rooms[source.pos.roomName];

        if (room === undefined) {
            this.debug('Invalid because source room ' + source.pos.roomName + ' is not visible');
            return false;
        }

        if (room.controller.owner !== undefined) {
            this.debug('Invalid because ' + room.controller.owner + ' is the owner of room ' + source.pos.roomName);
            return false;
        }

        this.debug('Room reservation is ' + room.controller.reservation);

        if (room.controller.reservation !== undefined) {
            this.debug('Invalid because ' + source.pos.roomName + ' is reserved by ' + room.controller.reservation.username);
            return false;
        }

        return true;
    }
}

module.exports = CreepImporter;