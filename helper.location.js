var ProfiledClass = require('class.profiled');

class LocationHelper extends ProfiledClass {

    static clearCache(findType) {
        this.incrementProfilerCount('LocationHelper.clearCache');

        if (!Array.isArray(findType)) {
            findType = [findType];
        }

        for (let idxType in findType) {
            this.writeToCache(findType[idxType], undefined);
        }
    }

    static doFindIds(findType, roomNames = undefined) {
        this.incrementProfilerCount('LocationHelper.doFindIds');

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
        this.incrementProfilerCount('LocationHelper.findClosestId');

        let closestLocationId = false;
        let closestLocationDistance = Infinity;
        let PathHelper = require('helper.path');

        for (let idxId in locationIds) {
            let location = Game.getObjectById(locationIds[idxId]);

            if (location) {
                try {
                    let distance = PathHelper.distance(position, location.pos);

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
        this.incrementProfilerCount('LocationHelper.findClosestPosition');

        let closestPosition = false;
        let closestPositionDistance = Infinity;
        let PathHelper = require('helper.path');

        for (let idxPosition in positions) {
            let distance = PathHelper.distance(start, positions[idxPosition]);

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
            this.incrementProfilerCount('LocationHelper.findIds.cached');

            // Cached ids are indexed first by room
            for (let idxRoom in cachedIds) {
                let includeInResult = false;

                if (roomNames == undefined) {
                    includeInResult = true;
                } else if (roomNames.indexOf(idxRoom) !== -1) {
                    includeInResult = true;
                }

                if (includeInResult) {
                    resultIds = resultIds.concat(cachedIds[idxRoom]);
                }
            }

            return resultIds;
        }

        this.incrementProfilerCount('LocationHelper.findIds.uncached');
        resultIds = this.doFindIds(findType, roomNames);

        this.writeToCache(findType, resultIds);

        return resultIds;
    }

    static findStructures(structureType, roomNames = undefined) {
        this.incrementProfilerCount('LocationHelper.findStructures');

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
        this.incrementProfilerCount('LocationHelper.getCacheLifespan');

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
        this.incrementProfilerCount('LocationHelper.getCreepIdsByPosition');

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
        this.incrementProfilerCount('LocationHelper.getOpenSpacesAroundCount');

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
        this.incrementProfilerCount('LocationHelper.getWalkableSpacesAroundCount');

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
        this.incrementProfilerCount('LocationHelper.isCacheObsolete');

        let timestamp = super.readFromCache('findResults.timestamp.' + findType);

        if (!timestamp) {
            return true;
        }

        return (Game.time - timestamp > this.getCacheLifespan(findType));
    }

    static isExit(pos) {
        this.incrementProfilerCount('LocationHelper.isExit');

        return pos.x == 0 || pos.x == 49 || pos.y == 0 || pos.y == 49;
    }

    static readFromCache(findType) {
        this.incrementProfilerCount('LocationHelper.readFromCache');

        if (this.isCacheObsolete(findType)) {
            this.writeToCache(findType, undefined);
            return undefined;
        }

        return super.readFromCache('findResults.' + findType);
    }

    static writeToCache(findType, locationIds) {
        this.incrementProfilerCount('LocationHelper.writeToCache');

        let nonCacheTypes = [FIND_HOSTILE_CREEPS];

        if (nonCacheTypes.indexOf(findType) !== -1) {
            return false;
        }

        let locationIdsByRoom = {};

        // Sort the locations by room
        for (let idxId in locationIds) {
            let location = Game.getObjectById(locationIds[idxId]);

            if (!locationIdsByRoom[location.pos.roomName]) {
                locationIdsByRoom[location.pos.roomName] = [];
            }

            locationIdsByRoom[location.pos.roomName].push(locationIds[idxId]);
        }

        // Write the locations to the cache, sorted by room
        for (let idxRoom in locationIdsByRoom) {
            super.writeToCache('findResults.' + findType + '.' + idxRoom, locationIdsByRoom[idxRoom]);
        }

        super.writeToCache('findResults.timestamp.' + findType, Game.time);
    }

}

module.exports = LocationHelper;
