class LocationHelper {

    static clearCache(findType) {
        if (!Array.isArray(findType)) {
            findType = [findType];
        }

        for (idxType in findType) {
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
                console.log('LocationHelper executed a find ' + findType);

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
                    let path = PathHelper.find(position, location.pos);

                    if (path.length < closestLocationDistance) {
                        closestLocationId = locationIds[idxId];
                        closestLocationDistance = path.length;
                    }
                } catch(error) {
                    console.log('Could not find path from ' + position + ' to ' + location.pos);
                }
            }
        }

        return closestLocationId;
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

                    if (roomNames.indexOf(gameObject.pos.roomName) !== -1) {
                        resultIds.push(cachedIds[idxId]);
                    }
                }

                return resultIds;
            }
        }

        resultIds = this.doFindIds(findType, roomNames);

        if (this.shouldCache(findType)) {
            this.writeToCache(findType, resultIds);
        }

        return resultIds;
    }

    static getOpenSpacesAroundCount(position) {
        let result = 0;
        let objects = false;

        for (let idxX = position.x - 1; idxX <= position.x + 1; idxX++) {
            for (let idxY = position.y - 1; idxY <= position.y + 1; idxY++) {
                if (idxX !== position.x || idxY !== position.y) {
                    if (this.isSpaceOpen(new RoomPosition(idxX, idxY, position.roomName))) {
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

        for (let idxX = position.x - 1; idxX <= position.x + 1; idxX++) {
            for (let idxY = position.y - 1; idxY <= position.y + 1; idxY++) {
                if (idxX !== position.x || idxY !== position.y) {
                    if (this.isSpaceWalkable(new RoomPosition(idxX, idxY, position.roomName))) {
                        result++;
                    }
                }
            }
        }

        return result;
    }

    static isSpaceOpen(position) {
        if (!this.isSpaceWalkable(position)) {
            return false;
        }

        let objects = Game.rooms[position.roomName].lookAt(position.x, position.y);

        for (let idxObjects in objects) {
            let object = objects[idxObjects];

            if (['creep'].indexOf(object.type) !== -1) {
                return false;
            }
        }

        return true;
    }

    static isSpaceWalkable(position) {
        let objects = Game.rooms[position.roomName].lookAt(position.x, position.y);

        for (let idxObjects in objects) {
            let object = objects[idxObjects];

            if (['creep','resource','tombstone'].indexOf(object.type) !== -1) {
                return true;
            }

            if (object.type == 'structure') {
                if (['constructedWall','controller','wall'].indexOf(object.structure.structureType) !== -1) {
                    return false;
                }

                if (['road'].indexOf(object.structure.structureType) !== -1) {
                    return true;
                }

                console.log('Unsure of passability of structure ' + object.structure.structureType);
            }

            if (object.type == 'terrain') {
                if (['wall'].indexOf(object.terrain) !== -1) {
                    return false;
                }

                if (['plain','swamp'].indexOf(object.terrain) !== -1) {
                    return true;
                }

                console.log('Unsure of passability of terrain ' + object.terrain);
            }
        }

        return false;
    }

    static readFromCache(findType) {
        let uncachedTypes = [FIND_HOSTILE_CREEPS];

        if (uncachedTypes.indexOf(findType) !== -1) {
            return undefined;
        }

        if (!Memory.findResults) {
            return undefined;
        }

        return Memory.findResults[findType];
    }

    static shouldCache(findType) {
        let shouldNotCache = [FIND_DROPPED_RESOURCES];
        return shouldNotCache.indexOf(findType) == -1;
    }

    static writeToCache(findType, locationIds) {
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
