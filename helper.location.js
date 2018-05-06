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
