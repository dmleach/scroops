class LocationHelper {

    static doFindIds(findType) {
        let result = [];

        for (let roomName in Game.rooms) {
            let roomResult = Game.rooms[roomName].find(findType);

            for (let idxResult in roomResult) {
                result.push(roomResult[idxResult].id);
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

    static findIds(findType) {
        let resultIds = this.readFromCache(findType);

        if (resultIds) {
            return resultIds;
        }

        resultIds = this.doFindIds(findType);

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
    }

}

module.exports = LocationHelper;
