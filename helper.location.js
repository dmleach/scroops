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

    static findIds(findType) {
        let resultIds = this.readFromCache(findType);

        if (resultIds) {
            console.log('Fetched from cache');
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
        console.log('Writing to cache ' + findType + ' values ' + locationIds);

        if (!Memory.findResults) {
            Memory.findResults = {};
        }

        Memory.findResults[findType] = locationIds;
    }

}

module.exports = LocationHelper;
