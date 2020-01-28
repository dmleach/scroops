let MemoryAccessorClass = require('MemoryAccessor');

class RoomManager extends MemoryAccessorClass
{
    constructor(roomName) {
        super();

        this.roomName = roomName;
        this.findResults = {};
    }

    get energyAvailable() {
        return this.room.energyAvailable;
    }

    get energyCapacityAvailable() {
        return this.room.energyCapacityAvailable;
    }

    _getCacheExpiration(findType) {
        if (findType === FIND_DROPPED_RESOURCES) {
            return 3;
        } else if (findType === FIND_MY_SPAWNS) {
            return 10000;
        } else if (findType === FIND_SOURCES) {
            return 100000;
        } else if (findType === FIND_STRUCTURES) {
            return 50;
        }

        return 10;
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
        let cacheKey = this._getCacheKey(findType);
        let cachedSearch = this.getFromMemory(cacheKey);

        if (cachedSearch !== undefined) {
            if (cachedSearch.time !== undefined) {
                let elapsedTime = Game.time - cachedSearch.time;

                if (findType === FIND_DROPPED_RESOURCES) {
                    this.debug('Cached search time is ' + cachedSearch.time);
                    this.debug('Elapsed time for find type ' + findType + ' is ' + elapsedTime);
                    this.debug('Cache expiration is ' + this._getCacheExpiration(findType));
                }

                if (elapsedTime < this._getCacheExpiration(findType)) {
                    let findResults = this._getFindResultsFromFindString(cachedSearch.results);

                    if (findType === FIND_DROPPED_RESOURCES) {
                        this.debug('Returning cached result for ' + findType + ' in ' + this.roomName + ': ' + findResults)
                    }

                    return findResults;
                }
            }
        }

        if (this.findResults.hasOwnProperty(findType) === false) {
            this.warn('Call to find ' + this.findName(findType) + ' in room ' + this.roomName + ' has high CPU cost');
            let room = Game.rooms[this.roomName];

            if (room === undefined) {
                this.error('Cannot see room ' + this.roomName);
                return [];
            }

            let findResults = room.find(findType);
            this.findResults[findType] = findResults;
            this.putIntoMemory(this._getCacheKey(findType), { time: Game.time, results: this._getFindStringFromFindResults(findResults) });
        } else {
            this.debug('Retrieving ' + this.findName(findType) + ' in room ' + this.roomName + ' from memory');
        }

        // console.log('Find ' + this.findName(findType) + ' returning ' + this.findResults[findType]);
        return this.findResults[findType];
    }

    _getFindResultsFromFindString(findString) {
        let findResult = [];

        if (findString === undefined || findString === '') {
            return findResult;
        }

        let findStringIds = findString.toString().split(',');
        let gameObject;

        findStringIds.forEach(function(findStringId) {
            gameObject = Game.getObjectById(findStringId);

            if (gameObject !== null) {
                findResult.push(gameObject);
            }
        });

        return findResult;
    }

    _getFindStringFromFindResults(findResults) {
        if (findResults instanceof Array === false) {
            return '';
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

    getObstacles(position) {
        let obstacles = [];
        let structures = this.getStructures();

        for (let idxStructure = 0; idxStructure < structures.length; idxStructure++) {
            if (structures[idxStructure].structureType !== STRUCTURE_ROAD && structures[idxStructure].pos.isEqualTo(position)) {
                obstacles.push(structures[idxStructure]);
            }
        }

        return obstacles;
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
        return false;
    }

    get memoryKey() {
        return this.name;
    }

    get name() {
        return 'RoomManager';
    }

    get room() {
        return Game.rooms[this.roomName];
    }
}

module.exports = RoomManager;