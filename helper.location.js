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

    static find(findType) {
        let resultIds = this.findIds(findType);
        let result = [];

        for (let idxResult in resultIds) {
            let gameObject = Game.getObjectById(resultIds[idxResult]);
            result.push(gameObject);
        }

        return result;
    }

    static findClosest(position, locations) {
        let PathHelper = require('helper.path');
        let closestLocation = false;
        let closestLocationDistance = Infinity;

        for (let idxLocation in locations) {
            let location = locations[idxLocation];
            let path = PathHelper.find(position, location.pos);

            if (path.length < closestLocationDistance) {
                closestLocation = location;
                closestLocationDistance = path.length;
            }
        }

        return closestLocation;
    }

    static findIds(findType) {
        let resultIds = this.readFromCache(findType);

        if (resultIds) {
            return resultIds;
        }

        resultIds = this.doFindIds(findType);
        this.writeToCache(findType, resultIds);

        return resultIds;
    }

    static readFromCache(findType) {
        if (!Memory.findResults) {
            return undefined;
        }

        return Memory.findResults[findType];
    }

    static writeToCache(findType, locationIds) {
        if (!Memory.findResults) {
            Memory.findResults = {};
        }

        Memory.findResults[findType] = locationIds;
    }

}

module.exports = LocationHelper;
