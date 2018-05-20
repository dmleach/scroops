class LocationHelper {

    static clearCache(findType) {
        if (!Array.isArray(findType)) {
            findType = [findType];
        }

        for (let idxType in findType) {
            Memory.findResults[findType[idxType]] = undefined;
        }
    }

    static doFindIds(findType, roomNames = undefined) {
        if (roomNames) {
            if (Array.isArray(roomNames) == false) {
                roomNames = [roomNames];
            }
        } else {
            roomNames = Object.keys(Game.rooms);
        }

        let result = [];

        for (let idxRoom in roomNames) {
            let room = Game.rooms[roomNames[idxRoom]];

            if (room) {
                let roomResult = room.find(findType);

                for (let idxResult in roomResult) {
                    result.push(roomResult[idxResult].id);
                }
            }
        }

        return result;
    }

    static findClosestId(position, locationIds) {
        let closestLocationId = false;
        let closestLocationDistance = Infinity;
        let PathHelper = require('helper.path');

        for (let idxId in locationIds) {
            let location = Game.getObjectById(locationIds[idxId]);

            if (location) {
                try {
                    let distance = position.getRangeTo(location);

                    if (distance < closestLocationDistance) {
                        closestLocationId = locationIds[idxId];
                        closestLocationDistance = distance;
                    }
                } catch(error) {
                    console.log('Could not find path from ' + position + ' to ' + location.pos + ' (' + error.message + ')');
                }
            }
        }

        return closestLocationId;
    }

    static findClosestPosition(start, positions) {
        let closestPosition = false;
        let closestPositionDistance = Infinity;
        let PathHelper = require('helper.path');

        for (let idxPosition in positions) {
            let distance = start.getRangeTo(positions[idxPosition]);

            if (distance < closestPositionDistance) {
                closestPosition = positions[idxPosition];
                closestPositionDistance = distance;
            }
        }

        return closestPosition;
    }

    static findIds(findType, roomNames = undefined) {
        let resultIds = [];

        if (roomNames) {
            if (Array.isArray(roomNames) == false) {
                roomNames = [roomNames];
            }
        }

        // First check to see if the result has been cached
        let cachedIds = this.readFromCache(findType);

        if (cachedIds) {
            if (!roomNames) {
                return cachedIds;
            } else {
                for (let idxId in cachedIds) {
                    let gameObject = Game.getObjectById(cachedIds[idxId]);

                    if (gameObject) {
                        if (roomNames.indexOf(gameObject.pos.roomName) !== -1) {
                            resultIds.push(cachedIds[idxId]);
                        }
                    }
                }

                return resultIds;
            }
        }

        resultIds = this.doFindIds(findType, roomNames);

        this.writeToCache(findType, resultIds);

        return resultIds;
    }

    static findStructures(structureType, roomNames = undefined) {
        let resultIds = [];
        let structureIds = this.findIds(FIND_STRUCTURES, roomNames);

        for (let idxId in structureIds) {
            let structure = Game.getObjectById(structureIds[idxId]);

            if (structure) {
                if (structure.structureType == structureType) {
                    resultIds.push(structureIds[idxId]);
                }
            }
        }

        return resultIds;
    }

    static getCacheLifespan(findType) {
        switch (findType) {
            case FIND_CREEPS:
            case FIND_MY_CREEPS:
                return 5;
            case FIND_DROPPED_ENERGY:
            case FIND_DROPPED_RESOURCES:
            case FIND_FLAGS:
            case FIND_CONSTRUCTION_SITES:
            case FIND_MY_CONSTRUCTION_SITES:
            case FIND_HOSTILE_CONSTRUCTION_SITES:
            case FIND_TOMBSTONES:
                return 10;
            case FIND_SOURCES_ACTIVE:
            case FIND_STRUCTURES:
            case FIND_MY_STRUCTURES:
            case FIND_HOSTILE_STRUCTURES:
                return 100;
            case FIND_MY_SPAWNS:
            case FIND_HOSTILE_SPAWNS:
                return 1000;
            case FIND_SOURCES:
                return Infinity;
            default:
                return 10;
        }
    }

    static getCreepIdsByPosition(position) {
        let creepIds = [];
        let objects = Game.rooms[position.roomName].lookAt(position.x, position.y);

        for (let idxObjects in objects) {
            let gameObject = objects[idxObjects];

            if (gameObject.type == 'creep') {
                creepIds.push(gameObject[gameObject.type].id);
            }
        }

        return creepIds;
    }

    static getOpenSpacesAroundCount(position) {
        let result = 0;
        let objects = false;
        let PathHelper = require('helper.path');

        for (let idxX = position.x - 1; idxX <= position.x + 1; idxX++) {
            for (let idxY = position.y - 1; idxY <= position.y + 1; idxY++) {
                if (idxX !== position.x || idxY !== position.y) {
                    if (PathHelper.isSpaceOpen(new RoomPosition(idxX, idxY, position.roomName))) {
                        result++;
                    }
                }
            }
        }

        return result;
    }

    static getWalkableSpacesAroundCount(position) {
        let result = 0;
        let objects = false;
        let PathHelper = require('helper.path');

        for (let idxX = position.x - 1; idxX <= position.x + 1; idxX++) {
            for (let idxY = position.y - 1; idxY <= position.y + 1; idxY++) {
                if (idxX !== position.x || idxY !== position.y) {
                    if (PathHelper.isSpaceWalkable(new RoomPosition(idxX, idxY, position.roomName))) {
                        result++;
                    }
                }
            }
        }

        return result;
    }

    static isCacheObsolete(findType) {
        if (!Memory.findResults) {
            return true;
        }

        if (!Memory.findResults.timestamp) {
            return true;
        }

        let cacheTimestamp = Memory.findResults.timestamp[findType];

        if (!cacheTimestamp) {
            return true;
        }

        if (Game.time - cacheTimestamp > this.getCacheLifespan(findType)) {
            return true;
        }

        return false;
    }

    static isExit(pos) {
        return pos.x == 0 || pos.x == 49 || pos.y == 0 || pos.y == 49;
    }

    static readFromCache(findType) {
        if (!Memory.findResults) {
            return undefined;
        }

        if (this.isCacheObsolete(findType)) {
            this.clearCache(findType);
            return undefined;
        }

        return Memory.findResults[findType];
    }

    static writeToCache(findType, locationIds) {
        let nonCacheTypes = [FIND_HOSTILE_CREEPS];

        if (nonCacheTypes.indexOf(findType) !== -1) {
            return false;
        }

        if (!Memory.findResults) {
            Memory.findResults = {};
        }

        Memory.findResults[findType] = locationIds;

        if (!Memory.findResults.timestamp) {
            Memory.findResults.timestamp = {};
        }

        Memory.findResults.timestamp[findType] = Game.time;
    }

}

module.exports = LocationHelper;
