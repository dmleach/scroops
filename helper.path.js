class PathHelper {

    static exitDestination(exit) {
        let Profiler = require('helper.profiler');
        Profiler.increment('PathHelper.exitDestination');

        if (!(exit instanceof RoomPosition)) {
            throw new Error('Value given to exitDestination must be a RoomPosition');
        }

        let destination = new RoomPosition(0, 0, exit.roomName);
        let adjacentRooms = Game.map.describeExits(exit.roomName);

        if (exit.x == 0) {
            destination.roomName = adjacentRooms[FIND_EXIT_LEFT];
            destination.x = 48;
            destination.y = exit.y;
        } else if (exit.x == 49) {
            destination.roomName = adjacentRooms[FIND_EXIT_RIGHT];
            destination.x = 1;
            destination.y = exit.y;
        } else if (exit.y == 0) {
            destination.roomName = adjacentRooms[FIND_EXIT_TOP];
            destination.x = exit.x;
            destination.y = 48;
        } else if (exit.y == 49) {
            destination.roomName = adjacentRooms[FIND_EXIT_BOTTOM];
            destination.x = exit.x;
            destination.y = 1;
        }

        return destination;
    }

    static find(start, end) {
        let Profiler = require('helper.profiler');
        Profiler.increment('PathHelper.find');

        if (!start) {
            throw new Error('Start position must be supplied to find');
        }

        if (!end) {
            throw new Error('End position must be supplied to find');
        }

        let path;

        try {
            path = this.readFromCache(start, end);
        } catch(error) {
            path = undefined;
            console.log(error.message);
        }

        if (path) {

            return path;
        }

        let destination = end;
        let LocationHelper = require('helper.location');

        if (LocationHelper.isExit(end)) {
            destination = this.exitDestination(end);
            console.log('Exit ' + end + ' destination is ' + destination);
        }

        path = start.findPathTo(destination, { ignoreCreeps: true });
        this.writeToCache(start, end, path);

        return path[0];
    }

    static findToRoom(start, roomName) {
        let Profiler = require('helper.profiler');
        Profiler.increment('PathHelper.findToRoom');

        if (!start) {
            throw new Error('Start position must be supplied to findToRoom');
        }

        if (!roomName) {
            throw new Error('Room name must be supplied to findToRoom');
        }

        let RoomHelper = require('helper.room');
        let direction = undefined;

        try {
            direction = RoomHelper.getDirectionToRoom(start, roomName);
        } catch (Error) {
            throw new Error('Rooms given to findToRoom are not adjacent');
        }

        let exits = RoomHelper.findExits(start.roomName, [direction]);
        let LocationHelper = require('helper.location');
        let closestExit = LocationHelper.findClosestPosition(start, exits);
        return this.exitDestination(closestExit);
    }

    static getPosByDirection(position, direction) {
        let Profiler = require('helper.profiler');
        Profiler.increment('PathHelper.getPosByDirection');

        switch (direction) {
            case TOP:
                return new RoomPosition(position.x, position.y-1, position.roomName);
            case TOP_RIGHT:
                return new RoomPosition(position.x+1, position.y-1, position.roomName);
            case RIGHT:
                return new RoomPosition(position.x+1, position.y, position.roomName);
            case BOTTOM_RIGHT:
                return new RoomPosition(position.x+1, position.y+1, position.roomName);
            case BOTTOM:
                return new RoomPosition(position.x, position.y+1, position.roomName);
            case BOTTOM_LEFT:
                return new RoomPosition(position.x-1, position.y+1, position.roomName);
            case LEFT:
                return new RoomPosition(position.x-1, position.y, position.roomName);
            case TOP_LEFT:
                return new RoomPosition(position.x-1, position.y-1, position.roomName);
            default:
                throw new Error('Direction ' + direction + ' given to getPosByDirection is not valid');
        }
    }

    static isSpaceOpen(position) {
        let Profiler = require('helper.profiler');
        Profiler.increment('PathHelper.isSpaceOpen');

        if (!this.isSpaceWalkable(position)) {
            return false;
        }

        let LocationHelper = require('helper.location');
        let creepIds = LocationHelper.getCreepIdsByPosition(position);

        return creepIds.length == 0;
    }

    static isSpaceWalkable(position) {
        let Profiler = require('helper.profiler');
        Profiler.increment('PathHelper.isSpaceWalkable');

        let isWalkable = this.readWalkableFromCache(position);

        if (isWalkable !== undefined) {
            return isWalkable;
        }

        let objects = Game.rooms[position.roomName].lookAt(position.x, position.y);

        for (let idxObjects in objects) {
            let object = objects[idxObjects];

            if (['creep','resource','tombstone'].indexOf(object.type) !== -1) {
                this.writeWalkableToCache(position, true);
                return true;
            }

            if (object.type == 'structure') {
                if (['constructedWall','controller','wall'].indexOf(object.structure.structureType) !== -1) {
                    this.writeWalkableToCache(position, false);
                    return false;
                }

                if (['container','rampart','road'].indexOf(object.structure.structureType) !== -1) {
                    this.writeWalkableToCache(position, true);
                    return true;
                }

                console.log('Unsure of passability of structure ' + object.structure.structureType);
            }

            if (object.type == 'terrain') {
                if (['wall'].indexOf(object.terrain) !== -1) {
                    this.writeWalkableToCache(position, false);
                    return false;
                }

                if (['plain','swamp'].indexOf(object.terrain) !== -1) {
                    this.writeWalkableToCache(position, true);
                    return true;
                }

                console.log('Unsure of passability of terrain ' + object.terrain);
            }
        }

        this.writeWalkableToCache(position, false);
        return false;
    }

    static moveBlockingCreeps(position, direction) {
        let Profiler = require('helper.profiler');
        Profiler.increment('PathHelper.moveBlockingCreeps');

        let LocationHelper = require('helper.location');
        let blockingCreepIds = LocationHelper.getCreepIdsByPosition(position);

        for (let idxId in blockingCreepIds) {
            let blockingCreep = Game.getObjectById(blockingCreepIds[idxId]);
            let unmovableRoles = ['Harvester'];
            let CreepHelper = require('helper.creep');

            if (unmovableRoles.indexOf(CreepHelper.getRoleByName(blockingCreep.name)) !== -1) {
                return false;
            }

            blockingCreep.move((direction + 4) % 8);
        }

        return true;
    }

    static readFromCache(start, end) {
        let Profiler = require('helper.profiler');
        Profiler.increment('PathHelper.readFromCache');

        if (!start) {
            throw new Error('Start position must be supplied to readFromCache');
        }

        if (!end) {
            throw new Error('End position must be supplied to readFromCache');
        }

        if (!Memory.pathResults) {
            return false;
        }

        if (!Memory.pathResults[start.roomName]) {
            return false;
        }

        if (!Memory.pathResults[start.roomName][start.x]) {
            return false;
        }

        if (!Memory.pathResults[start.roomName][start.x][start.y]) {
            return false;
        }

        if (!Memory.pathResults[start.roomName][start.x][start.y][end.roomName]) {
            return false;
        }

        if (!Memory.pathResults[start.roomName][start.x][start.y][end.roomName][end.x]) {
            return false;
        }

        if (!Memory.pathResults[start.roomName][start.x][start.y][end.roomName][end.x][end.y]) {
            return false;
        }

        return Memory.pathResults[start.roomName][start.x][start.y][end.roomName][end.x][end.y];
    }

    static readWalkableFromCache(pos) {
        let Profiler = require('helper.profiler');
        Profiler.increment('PathHelper.readWalkableFromCache');

        if (!pos) {
            throw new Error('Position must be supplied to readWalkableFromCache');
        }

        if (!Memory.pathResults) {
            return undefined;
        }

        if (!Memory.pathResults[pos.roomName]) {
            return undefined;
        }

        if (!Memory.pathResults[pos.roomName][pos.x]) {
            return undefined;
        }

        if (!Memory.pathResults[pos.roomName][pos.x][pos.y]) {
            return undefined;
        }

        if (!Memory.pathResults[pos.roomName][pos.x][pos.y]['walkable']) {
            return undefined;
        }

        if (!Memory.pathResults[pos.roomName][pos.x][pos.y]['walkable']['timestamp']) {
            return undefined;
        }

        if (Game.time - 100 > Memory.pathResults[pos.roomName][pos.x][pos.y]['walkable']['timestamp']) {
            return undefined;
        }

        return Memory.pathResults[pos.roomName][pos.x][pos.y]['walkable']['value'];
    }

    static writeToCache(start, end, path) {
        let Profiler = require('helper.profiler');
        Profiler.increment('PathHelper.writeToCache');

        if (!start) {
            throw new Error('Start position must be supplied to writeToCache');
        }

        if (!end) {
            throw new Error('End position must be supplied to writeToCache');
        }

        if (!path || path.length == 0) {
            throw new Error('Valid path must be supplied to writeToCache');
        }

        if (!Memory.pathResults) {
            Memory.pathResults = {};
        }

        if (!Memory.pathResults[start.roomName]) {
            Memory.pathResults[start.roomName] = {};
        }

        if (!Memory.pathResults[start.roomName][start.x]) {
            Memory.pathResults[start.roomName][start.x] = {};
        }

        if (!Memory.pathResults[start.roomName][start.x][start.y]) {
            Memory.pathResults[start.roomName][start.x][start.y] = {};
        }

        if (!Memory.pathResults[start.roomName][start.x][start.y][end.roomName]) {
            Memory.pathResults[start.roomName][start.x][start.y][end.roomName] = {};
        }

        if (!Memory.pathResults[start.roomName][start.x][start.y][end.roomName][end.x]) {
            Memory.pathResults[start.roomName][start.x][start.y][end.roomName][end.x] = {};
        }

        if (!Memory.pathResults[start.roomName][start.x][start.y][end.roomName][end.x][end.y]) {
            Memory.pathResults[start.roomName][start.x][start.y][end.roomName][end.x][end.y] = {};
        }

        // We don't need to store the whole path; only the first step
        Memory.pathResults[start.roomName][start.x][start.y][end.roomName][end.x][end.y] = path[0];
    }

    static writeWalkableToCache(pos, walkable) {
        let Profiler = require('helper.profiler');
        Profiler.increment('PathHelper.writeWalkableToCache');

        if (!pos) {
            throw new Error('Position must be supplied to writeWalkableToCache');
        }

        if (!Memory.pathResults) {
            Memory.pathResults = {};
        }

        if (!Memory.pathResults[pos.roomName]) {
            Memory.pathResults[pos.roomName] = {};
        }

        if (!Memory.pathResults[pos.roomName][pos.x]) {
            Memory.pathResults[pos.roomName][pos.x] = {};
        }

        if (!Memory.pathResults[pos.roomName][pos.x][pos.y]) {
            Memory.pathResults[pos.roomName][pos.x][pos.y] = {};
        }

        if (!Memory.pathResults[pos.roomName][pos.x][pos.y]['walkable']) {
            Memory.pathResults[pos.roomName][pos.x][pos.y]['walkable'] = {};
        }

        Memory.pathResults[pos.roomName][pos.x][pos.y]['walkable']['value'] = walkable;
        Memory.pathResults[pos.roomName][pos.x][pos.y]['walkable']['timestamp'] = Game.time;
    }

}

module.exports = PathHelper;
