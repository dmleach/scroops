var ProfiledClass = require('class.profiled');

class PathHelper extends ProfiledClass {

    /**
     * Retrieves information about the path from start to end from the cache,
     * or calculates and returns the path if no cached information is found.
     * If the return value is an object with properties 'direction' and
     * 'length,' the information was cached and the individual steps are not
     * available. If the return value is an array, it is the result of a call
     * to RoomPosition.findPathTo
     */
    static calculatePath(start, end) {
        this.incrementProfilerCount('PathHelper.calculatePath');

        if (!start) {
            throw 'Start position must be supplied to calculatePath';
        }

        if (!end) {
            throw 'End position must be supplied to calculatePath';
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
        }

        path = start.findPathTo(destination, { ignoreCreeps: true });
        this.writeToCache(start, end, path);

        let result = {};
        result.direction = path[0].direction;
        result.length = path.length;
        return result;
    }

    static distance(start, end) {
        this.incrementProfilerCount('PathHelper.distance');

        let path = this.calculatePath(start, end);
        return path.length;
    }

    static exitDestination(exit) {
        this.incrementProfilerCount('PathHelper.exitDestination');

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

    static findToRoom(start, roomName) {
        this.incrementProfilerCount('PathHelper.findToRoom');

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
            throw 'Rooms given to findToRoom are not adjacent';
        }

        let exits = RoomHelper.findExits(start.roomName, [direction]);
        let LocationHelper = require('helper.location');
        let closestExit = LocationHelper.findClosestPosition(start, exits);
        return this.exitDestination(closestExit);
    }

    static getPosByDirection(position, direction) {
        this.incrementProfilerCount('PathHelper.getPosByDirection');

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
        this.incrementProfilerCount('PathHelper.isSpaceOpen');

        if (!this.isSpaceWalkable(position)) {
            return false;
        }

        let LocationHelper = require('helper.location');
        let creepIds = LocationHelper.getCreepIdsByPosition(position);

        return creepIds.length == 0;
    }

    static isSpaceWalkable(position) {
        this.incrementProfilerCount('PathHelper.isSpaceWalkable');

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
        this.incrementProfilerCount('PathHelper.moveBlockingCreeps');

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
        this.incrementProfilerCount('PathHelper.readFromCache');

        if (!start) {
            throw 'Start position must be supplied to readFromCache';
        }

        if (!end) {
            throw 'End position must be supplied to readFromCache';
        }

        return super.readFromCache(
            'pathResults.'
            + start.roomName + ',' + start.x + ',' + start.y + '.'
            + end.roomName + ',' + end.x + ',' + end.y
        );
    }

    static readWalkableFromCache(pos) {
        this.incrementProfilerCount('PathHelper.readWalkableFromCache');

        if (!pos) {
            throw new Error('Position must be supplied to readWalkableFromCache');
        }

        let walkableInfo = super.readFromCache('pathResults.' + pos.roomName + ',' + pos.x + ',' + pos.y + '.walkable');

        if (!walkableInfo) {
            return undefined;
        }

        if (Game.time - 100 > walkableInfo.timestamp) {
            return undefined;
        }

        return walkableInfo.value;
    }

    static writeToCache(start, end, path) {
        this.incrementProfilerCount('PathHelper.writeToCache');

        if (!start) {
            throw new Error('Start position must be supplied to writeToCache');
        }

        if (!end) {
            throw new Error('End position must be supplied to writeToCache');
        }

        if (!path || path.length == 0) {
            throw new Error('Valid path must be supplied to writeToCache');
        }

        let cacheKey = 'pathResults.'
            + start.roomName + ',' + start.x + ',' + start.y + '.'
            + end.roomName + ',' + end.x + ',' + end.y;
        super.writeToCache(cacheKey + '.direction', path[0].direction);
        super.writeToCache(cacheKey + '.length', path.length);
    }

    static writeWalkableToCache(pos, walkable) {
        this.incrementProfilerCount('PathHelper.writeWalkableToCache');

        if (!pos) {
            throw 'Position must be supplied to writeWalkableToCache';
        }

        let cacheKey = 'pathResults.' + pos.roomName + ',' + pos.x + ',' + pos.y + '.walkable';
        super.writeToCache(cacheKey + '.value', walkable);
        super.writeToCache(cacheKey + '.timestamp', Game.time);
    }

}

module.exports = PathHelper;
