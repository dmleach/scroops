let MemoryAccessorClass = require('MemoryAccessor');

class RoomManager extends MemoryAccessorClass
{
    constructor(roomName) {
        super();

        this.roomName = roomName;
        this.room = Game.rooms[roomName];
        this.findResults = {};
    }

    get energyAvailable() {
        return this.room.energyAvailable;
    }

    get energyCapacityAvailable() {
        return this.room.energyCapacityAvailable;
    }

    _getCacheKey(findType) {
        return findType.toString().padStart(4, '0') + this.roomName;
    }

    getConstructionSites() {
        return this._getFindResults(FIND_CONSTRUCTION_SITES);
    }

    getConstructionSitesByProgress() {
        let sites = this._getFindResults(FIND_CONSTRUCTION_SITES);
    }

    getContainers() {
        return this._getStructuresByType(STRUCTURE_CONTAINER);
    }

    getDroppedResources() {
        return this._getFindResults(FIND_DROPPED_RESOURCES);
    }

    getExtensions() {
        return this._getStructuresByType(STRUCTURE_EXTENSION);
    }

    getExtensionsByPosition(position) {
        let extensions = this.getExtensions();

        if (extensions === undefined) {
            return [];
        }

        let sortedExtensions = [];
        let GameObjectClass = require('GameObject');
        let extensionObject;
        let idxExtension;
        let idxClosestExtension;
        let closestExtensionRange;
        let UtilPathClass = require('UtilPath');
        let utilPath = new UtilPathClass();
        let path;

        while (extensions.length > 0) {
            idxClosestExtension = undefined;
            closestExtensionRange = 10000;

            for (idxExtension = 0; idxExtension < extensions.length; idxExtension++) {
                extensionObject = new GameObjectClass(extensions[idxExtension].id);
                path = utilPath.getPath(position, extensionObject.pos);

                if (path === undefined) {
                    continue;
                }

                if (idxClosestExtension === undefined || path.length < closestExtensionRange) {
                    idxClosestExtension = idxExtension;
                    closestExtensionRange = path.length;
                }
            }

            sortedExtensions.push(extensions[idxClosestExtension]);
            extensions.splice(idxClosestExtension, 1);
        }

        return sortedExtensions;
    }

    _getFindResults(findType) {
        if (this._getIsCached(findType)) {
            let cacheKey = this._getCacheKey(findType);
            let cachedResults = this.getFromMemory(cacheKey);

            if (cachedResults !== undefined) {
                return this._getFindResultsFromFindString(cachedResults);
            }
        }

        if (this.findResults.hasOwnProperty(findType) === false) {
            this.warn('Call to find ' + this.findName(findType) + ' has high CPU cost');
            let findResults = this.room.find(findType);
            this.findResults[findType] = findResults;

            if (this._getIsCached(findType)) {
                this.putIntoMemory(this._getCacheKey(findType), this._getFindStringFromFindResults(findResults))
            }
        }

        // console.log('Find ' + this.findName(findType) + ' returning ' + this.findResults[findType]);
        return this.findResults[findType];
    }

    _getFindResultsFromFindString(findString) {
        let findStringIds = findString.toString().split(',');
        let findResult = [];

        findStringIds.forEach(function(findStringId) {
            findResult.push(Game.getObjectById(findStringId));
        });

        return findResult;
    }

    _getFindStringFromFindResults(findResults) {
        if (findResults instanceof Array === false) {
            return undefined;
        }

        let findResultIds = [];

        findResults.forEach(function(findResult) {
            findResultIds.push(findResult.id);
        });

        return findResultIds.join(',');
    }

    getFriendlySpawns() {
        return this._getFindResults(FIND_MY_SPAWNS);
    }

    getHarvestContainers() {
        let containers = this.getContainers();
        let harvestContainers = [];
        let thisRoomManager = this;

        containers.forEach(function(container) {
            if (thisRoomManager.getRangeToNearest(container.pos, FIND_SOURCES) <= 3) {
                harvestContainers.push(container);
            }
        });

        return harvestContainers;
    }

    getHostileCreeps() {
        return this._getFindResults(FIND_HOSTILE_CREEPS);
    }

    _getIsCached(findType) {
        let cachedFindTypes = [FIND_SOURCES];
        // let cachedFindTypes = [];
        return cachedFindTypes.indexOf(findType) !== -1;
    }

    getRangeToNearest(position, findType) {
        let matchingObjects = this._getFindResults(findType);

        let nearestObjectId = undefined;
        let nearestObjectRange = 1000000;
        let range;

        matchingObjects.forEach(function(matchingObject) {
            range = position.getRangeTo(matchingObject.pos);

            if (range < nearestObjectRange) {
                nearestObjectId = matchingObject.id;
                nearestObjectRange = range;
            }
        });

        return nearestObjectRange;
    }

    getStructures() {
        return this._getFindResults(FIND_STRUCTURES);
    }

    getSources() {
        return this._getFindResults(FIND_SOURCES);
    }

    _getStructuresByType(structureType) {
        let structures = this._getFindResults(FIND_STRUCTURES);
        let matchingStructures = [];

        structures.forEach(function (structure) {
            if (structure.structureType === structureType) {
                matchingStructures.push(structure);
            }
        });

        return matchingStructures;
    }

    getTombstones() {
        return this._getFindResults(FIND_TOMBSTONES);
    }

    getTowers() {
        return this._getStructuresByType(STRUCTURE_TOWER);
    }

    get isFullEnergy() {
        return this.energyAvailable === this.energyCapacityAvailable;
    }

    get isShowingDebugMessages() {
        return true;
    }

    get memoryKey() {
        return this.name;
    }

    get name() {
        return 'RoomManager';
    }
}

module.exports = RoomManager;