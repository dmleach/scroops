let MemoryAccessorClass = require('MemoryAccessor');

class RoomManager extends MemoryAccessorClass
{
    get FIND_OBSTACLES() { return 9001; }

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

    _getCachedResults(cacheKey, expirationPeriod = 0) {
        if (cacheKey === undefined) {
            return undefined;
        }

        let cachedSearch = this.getFromMemory(cacheKey);

        if (cachedSearch === undefined) {
            return undefined;
        }

        if (cachedSearch.time === undefined) {
            return undefined;
        }

        let elapsedTime = Game.time - cachedSearch.time;

        if (elapsedTime > expirationPeriod) {
            return undefined;
        }

        let findResults = this._getFindResultsFromFindString(cachedSearch.results);
        return findResults;
    }

    _getCacheExpiration(findType) {
        if (findType === FIND_DROPPED_RESOURCES) {
            return 3;
        } else if (findType === this.FIND_OBSTACLES) {
            return 53;
        } else if (findType === FIND_MY_SPAWNS) {
            return 10000;
        } else if (findType === FIND_SOURCES) {
            return 100000;
        } else if (findType === FIND_STRUCTURES) {
            return 53;
        }

        return 11;
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

        let extensionIds = [];

        for (let idxExtension = 0; idxExtension < extensions.length; idxExtension++) {
            extensionIds.push(extensions[idxExtension].id);
        }

        let UtilPositionClass = require('UtilPosition');
        let utilPosition = new UtilPositionClass();
        let sortedExtensionIds = utilPosition.sortIdsByRange(extensionIds, position);

        extensions = [];

        for (let idxExtensionId = 0; idxExtensionId < sortedExtensionIds.length; idxExtensionId++) {
            extensions.push(Game.getObjectById([sortedExtensionIds[idxExtensionId]]));
        }

        return extensions;
    }

    _getFindResults(findType) {
        let cacheKey = this._getCacheKey(findType);
        let expirationPeriod = this._getCacheExpiration(findType);
        let cachedSearchResults = this._getCachedResults(cacheKey, expirationPeriod);

        if (cachedSearchResults !== undefined) {
            return cachedSearchResults;
        }

        // let cachedSearch = this.getFromMemory(cacheKey);
        //
        // if (cachedSearch !== undefined) {
        //     if (cachedSearch.time !== undefined) {
        //         let elapsedTime = Game.time - cachedSearch.time;
        //
        //         if (findType === FIND_DROPPED_RESOURCES) {
        //             this.debug('Cached search time is ' + cachedSearch.time);
        //             this.debug('Elapsed time for find type ' + findType + ' is ' + elapsedTime);
        //             this.debug('Cache expiration is ' + this._getCacheExpiration(findType));
        //         }
        //
        //         if (elapsedTime < this._getCacheExpiration(findType)) {
        //             let findResults = this._getFindResultsFromFindString(cachedSearch.results);
        //
        //             if (findType === FIND_DROPPED_RESOURCES) {
        //                 this.debug('Returning cached result for ' + findType + ' in ' + this.roomName + ': ' + findResults)
        //             }
        //
        //             return findResults;
        //         }
        //     }
        // }

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

    getInvaderCores() {
        return this._getStructuresByType(STRUCTURE_INVADER_CORE);
    }

    _getIsCached(findType) {
        let cachedFindTypes = [FIND_SOURCES];
        // let cachedFindTypes = [];
        return cachedFindTypes.indexOf(findType) !== -1;
    }

    getObstacles(position) {
        if (position === undefined) {
            return undefined;
        }

        if (position.roomName !== this.roomName) {
            return undefined;
        }

        let cacheKey = [this.FIND_OBSTACLES, this.roomName, position.x.toString(), position.y.toString()];
        let expirationPeriod = this._getCacheExpiration(this.FIND_OBSTACLES);
        let cachedSearchResults = this.getFromMemory(cacheKey);

        if (cachedSearchResults !== undefined) {
            if (cachedSearchResults.time !== undefined) {
                if (Game.time - cachedSearchResults.time < expirationPeriod) {
                    let returnValue = (cachedSearchResults === 'NONE') ? [] : this._getFindResultsFromFindString(cachedSearchResults.results);
                    this.debug('Returning obstacles at ' + position + ' from cache: ' + returnValue);
                    return returnValue;
                }
            }
        }

        let obstacles = [];

        let constructionSites = this.getConstructionSites();

        for (let idxSite = 0; idxSite < constructionSites.length; idxSite++) {
            if (constructionSites[idxSite].pos.isEqualTo(position)) {
                obstacles.push(constructionSites[idxSite]);
            }
        }

        let structures = this.getStructures();

        for (let idxStructure = 0; idxStructure < structures.length; idxStructure++) {
            if (structures[idxStructure].structureType !== STRUCTURE_ROAD && structures[idxStructure].pos.isEqualTo(position)) {
                obstacles.push(structures[idxStructure]);
            }
        }

        let valueToCache = (obstacles.length === 0) ? 'NONE' : this._getFindStringFromFindResults(obstacles);
        this.putIntoMemory(cacheKey, { time: Game.time, results: valueToCache });
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

    getRuins() {
        return this._getFindResults(FIND_RUINS);
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