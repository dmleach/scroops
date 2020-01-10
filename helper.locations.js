var helperLocations = {

    cachedBuildLocations: undefined,
    cachedDepositLocations: undefined,
    cachedResources: undefined,
    cachedSources: undefined,
    cachedSpawns: undefined,
    cachedStructures: undefined,
    cachedWithdrawLocations: undefined,

    getBuildLocationById: function(locationId) {
        if (!locationId) {
            return false;
        }

        for (var idxLocation in this.getBuildLocations()) {
            if (this.getBuildLocations()[idxLocation].id == locationId) {
                return this.getBuildLocations()[idxLocation];
            }
        }

        return false;
    },

    getBuildLocations: function() {
        if (this.cachedBuildLocations) {
            return this.cachedBuildLocations;
        }

        var buildLocations = [];
        var baseHelper = require('helper.base');

        for (var idxConstruction in this.getConstructions()) {
            var construction = this.getConstructions()[idxConstruction];
            var buildLocation = {
                description: 'Construction at ' + construction.pos,
                id: construction.id,
                isInBase: baseHelper.isInBase(construction.pos),
                isInFriendlyRoom: baseHelper.isRoomFriendly(construction.room),
                isNearSource: this.isNearSource(construction.pos),
                pos: construction.pos,
                type: 'Construction',
            };

            buildLocations.push(buildLocation);
        }

        this.cachedBuildLocations = buildLocations;
        return buildLocations;
    },

    getBuildSiteById: function(siteId) {
        var buildLocation = this.getBuildLocationById(siteId);

        if (this.isValidBuildLocation(buildLocation)) {
            return Game.getObjectById(buildLocation.id);
        }

        return false;
    },

    getClosestBuildLocation: function(position, testFunction = undefined) {
        var possibleLocations = [];

        for (var idxLocation in this.getBuildLocations()) {
            var location = this.getBuildLocations()[idxLocation];

            if (testFunction) {
                if (testFunction(location)) {
                    possibleLocations.push(location);
                }
            } else {
                possibleLocations.push(location);
            }
        }

        if (possibleLocations.length == 0) {
            return false;
        }

        return this.sortLocationsByDistance(possibleLocations, position)[0];
    },

    getClosestDepositLocation: function(position, testFunction = undefined) {
        var possibleLocations = [];

        for (var idxLocation in this.getDepositLocations()) {
            var location = this.getDepositLocations()[idxLocation];

            if (testFunction) {
                if (testFunction(location)) {
                    possibleLocations.push(location);
                }
            } else {
                possibleLocations.push(location);
            }
        }

        if (possibleLocations.length == 0) {
            return false;
        }

        return this.sortLocationsByDistance(possibleLocations, position)[0];
    },

    getClosestWithdrawLocation: function(position, testFunction = undefined) {
        var possibleLocations = [];

        for (var idxLocation in this.getWithdrawLocations()) {
            var location = this.getWithdrawLocations()[idxLocation];

            if (this.isValidWithdrawLocation(location)) {
                if (testFunction) {
                    if (testFunction(location)) {
                        possibleLocations.push(location);
                    }
                } else {
                    possibleLocations.push(location);
                }
            }
        }

        if (possibleLocations.length == 0) {
            return false;
        }

        return this.sortLocationsByDistance(possibleLocations, position)[0];
    },

    getConstructions: function() {
        if (this.cachedConstructions) {
            return this.cachedConstructions;
        }

        var constructions = [];

        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            var roomConstructions = room.find(FIND_MY_CONSTRUCTION_SITES);

            for (var idxConstruction in roomConstructions) {
                var construction = roomConstructions[idxConstruction];
                constructions.push(construction);
            }
        }

        this.cachedConstructions = constructions;
        return constructions;
    },

    getDepositLocationById: function(locationId) {
        if (!locationId) {
            return false;
        }

        for (var idxLocation in this.getDepositLocations()) {
            if (this.getDepositLocations()[idxLocation].id == locationId) {
                return this.getDepositLocations()[idxLocation];
            }
        }

        return false;
    },

    getDepositLocations: function() {
        if (this.cachedDepositLocations) {
            return this.cachedDepositLocations;
        }

        var depositLocations = [];
        var baseHelper = require('helper.base');

        for (var idxSpawn in this.getSpawns()) {
            var spawn = this.getSpawns()[idxSpawn];
            var depositLocation = {
                description: spawn.name + ' at ' + spawn.pos,
                id: spawn.id,
                isInBase: baseHelper.isInBase(spawn.pos),
                isInFriendlyRoom: baseHelper.isRoomFriendly(spawn.room),
                isNearSource: this.isNearSource(spawn.pos),
                pos: spawn.pos,
                type: 'Spawn',
            };

            depositLocations.push(depositLocation);
        }

        for (var idxStructure in this.getStructures()) {
            var structure = this.getStructures()[idxStructure];
            var energyStructures = [STRUCTURE_CONTAINER, STRUCTURE_EXTENSION, STRUCTURE_TOWER];

            var structureTypeName = 'Unknown';

            switch (structure.structureType) {
                case STRUCTURE_CONTAINER:
                    structureTypeName = 'Container';
                    break;
                case STRUCTURE_EXTENSION:
                    structureTypeName = 'Extension';
                    break;
                case STRUCTURE_TOWER:
                    structureTypeName = 'Tower';
                    break;
            }

            if (energyStructures.indexOf(structure.structureType) !== -1) {
                var depositLocation = {
                    description: structureTypeName + ' at ' + structure.pos,
                    id: structure.id,
                    isInBase: baseHelper.isInBase(structure.pos),
                    isInFriendlyRoom: baseHelper.isRoomFriendly(structure.room),
                    isNearSource: this.isNearSource(structure.pos),
                    pos: structure.pos,
                    type: structureTypeName,
                };

                depositLocations.push(depositLocation);
            }
        }

        this.cachedDepositLocations = depositLocations;
        return depositLocations;
    },

    getDepositLocationsByType: function(type) {
        var locations = [];

        for (var idxLocation in this.getDepositLocations()) {
            var location = this.getDepositLocations()[idxLocation];

            if (location.type == type) {
                locations.push(location);
            }
        }

        return locations;
    },

    getDepositSiteById: function(siteId) {
        var depositLocation = this.getDepositLocationById(siteId);

        if (this.isValidDepositLocation(depositLocation)) {
            return Game.getObjectById(depositLocation.id);
        }

        return false;
    },

    getFullestWithdrawLocation: function(testFunction = undefined) {
        var possibleLocations = [];

        for (var idxLocation in this.getWithdrawLocations()) {
            var location = this.getWithdrawLocations()[idxLocation];

            if (testFunction) {
                if (testFunction(location)) {
                    possibleLocations.push(location);
                }
            } else {
                possibleLocations.push(location);
            }
        }

        if (possibleLocations.length == 0) {
            return false;
        }

        return this.sortLocationsByEnergy(possibleLocations).reverse()[0];
    },

    getResources: function() {
        if (this.cachedResources) {
            return this.cachedResources;
        }

        var resources = [];

        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            var roomResources = room.find(FIND_DROPPED_RESOURCES);

            for (var idxResource in roomResources) {
                var resource = roomResources[idxResource];
                resources.push(resource);
            }
        }

        this.cachedResources = resources;
        return resources;
    },

    getSources: function() {
        if (this.cachedSources) {
            var sources = [];

            for (var idxSource in this.cachedSources) {
                var source = this.cachedSources[idxSource];

                if (Game.getObjectById(source.id)) {
                    sources.push(source);
                }
            }

            this.cachedSources = sources;
            return this.cachedSources;
        }

        var sources = [];

        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            var roomSources = room.find(FIND_SOURCES);

            for (var idxSource in roomSources) {
                var source = roomSources[idxSource];
                sources.push(source);
            }
        }

        this.cachedSources = sources;
        return sources;
    },

    getSpawns: function() {
        if (this.cachedSpawns) {
            return this.cachedSpawns;
        }

        var spawns = [];

        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            var roomSpawns = room.find(FIND_MY_SPAWNS);

            for (var idxSpawn in roomSpawns) {
                var spawn = roomSpawns[idxSpawn];
                spawns.push(spawn);
            }
        }

        this.cachedSpawns = spawns;
        return spawns;
    },

    getStructures: function() {
        if (this.cachedStructures) {
            var structures = [];

            for (var idxStructure in this.cachedStructures) {
                var structure = this.cachedStructures[idxStructure];

                if (Game.getObjectById(structure.id)) {
                    structures.push(structure);
                }
            }

            this.cachedStructures = structures;
            return this.cachedStructures;
        }

        var structures = [];

        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            var roomStructures = room.find(FIND_STRUCTURES);

            for (var idxStructure in roomStructures) {
                var structure = roomStructures[idxStructure];
                structures.push(structure);
            }
        }

        this.cachedStructures = structures;
        return structures;
    },

    getWithdrawLocations: function() {
        if (this.cachedWithdrawLocations) {
            return this.cachedWithdrawLocations;
        }

        var withdrawLocations = [];
        var baseHelper = require('helper.base');

        for (var idxStructure in this.getStructures()) {
            var structure = this.getStructures()[idxStructure];

            if (structure.structureType == STRUCTURE_CONTAINER) {
                var withdrawLocation = {
                    description: 'Container at ' + structure.pos,
                    id: structure.id,
                    isInBase: baseHelper.isInBase(structure.pos),
                    isInFriendlyRoom: baseHelper.isRoomFriendly(structure.room),
                    isNearSource: this.isNearSource(structure.pos),
                    pos: structure.pos,
                    type: 'Container',
                };

                withdrawLocations.push(withdrawLocation);
            }
        }

        for (var idxResource in this.getResources()) {
            var resource = this.getResources()[idxResource];
            var withdrawLocation = {
                description: 'Resource at ' + resource.pos,
                id: resource.id,
                isInBase: baseHelper.isInBase(resource.pos),
                isInFriendlyRoom: baseHelper.isRoomFriendly(resource.room),
                isNearSource: this.isNearSource(resource.pos),
                pos: resource.pos,
                type: 'Resource',
            };

            withdrawLocations.push(withdrawLocation);
        }

        this.cachedWithdrawLocations = withdrawLocations;
        return withdrawLocations;
    },

    getWithdrawLocationById: function(locationId) {
        if (!locationId) {
            return false;
        }

        for (var idxLocation in this.getWithdrawLocations()) {
            if (this.getWithdrawLocations()[idxLocation].id == locationId) {
                return this.getWithdrawLocations()[idxLocation];
            }
        }

        return false;
    },

    getWithdrawSiteById: function(siteId) {
        var withdrawLocation = this.getWithdrawLocationById(siteId);

        if (this.isValidWithdrawLocation(withdrawLocation)) {
            return Game.getObjectById(withdrawLocation.id);
        }

        return false;
    },

    isNearSource: function(position) {
        for (var idxSource in this.getSources()) {
            var range = position.getRangeTo(this.getSources()[idxSource]);

            if (range <= 3) {
                return true;
            }
        }

        return false;
    },

    isValidBuildLocation: function(location, debug = false) {
        if (!location) {
            return false;
        }

        var buildObject = Game.getObjectById(location.id);

        if (!(buildObject instanceof ConstructionSite)) {
            return false;
        }

        return buildObject.progress < buildObject.progressTotal;
    },

    isValidDepositLocation: function(location, debug = false) {
        if (!location) {
            return false;
        }

        var depositObject = Game.getObjectById(location.id);

        if (depositObject instanceof StructureSpawn) {
            if (debug) {
                console.log(location.description + ' energy is ' + depositObject.energy + ' of ' + depositObject.energyCapacity);
                console.log(location.description + ' is spawning: ' + depositObject.spawning);
            }

            return depositObject.energy < depositObject.energyCapacity
                && !depositObject.spawning;
        }

        if (depositObject instanceof StructureExtension || depositObject instanceof StructureTower) {
            if (debug) {
                console.log(location.description + ' energy is ' + depositObject.energy + ' of ' + depositObject.energyCapacity);
            }

            return depositObject.energy < depositObject.energyCapacity;
        }

        if (depositObject instanceof StructureContainer) {
            if (debug) {
                console.log(location.description + ' energy is ' + depositObject.store [RESOURCE_ENERGY] + ' of ' + depositObject.storeCapacity);
            }

            return depositObject.store [RESOURCE_ENERGY] < depositObject.storeCapacity;
        }

        console.log('Did not recognize type of deposit location ' + location.description + ' - ' + location.id);
        return false;
    },

    isValidWithdrawLocation: function(location, debug = false) {
        if (!location) {
            return false;
        }

        var withdrawObject = Game.getObjectById(location.id);

        if (!withdrawObject) {
            return false;
        }

        if (withdrawObject instanceof StructureContainer || withdrawObject instanceof Tombstone) {
            return withdrawObject.store [RESOURCE_ENERGY] > 0;
        }

        if (withdrawObject instanceof Resource) {
            return withdrawObject.energy > 0;
        }

        console.log('Did not recognize type of withdraw location ' + location.description + ' - ' + location.id);
        return false;
    },

    sortLocationsByDistance: function(locations, position) {
        for (var idxLocation in locations) {
            var location = locations[idxLocation];
            location.path = position.findPathTo(location.pos);
        }

        var distanceSortFunction = function(locationA, locationB) {
            return locationA.path.length - locationB.path.length;
        };

        locations.sort(distanceSortFunction);

        return locations;
    },

    sortLocationsByEnergy: function(locations) {
        for (var idxLocation in locations) {
            var location = locations[idxLocation];
            var locationObject = Game.getObjectById(location.id);

            if (locationObject instanceof StructureContainer || locationObject instanceof Tombstone) {
                location.energy = locationObject.store [RESOURCE_ENERGY];
            }

            if (locationObject instanceof Resource) {
                location.energy = locationObject.energy;
            }
        }

        var energySortFunction = function(locationA, locationB) {
            return locationA.energy - locationB.energy;
        }

        locations.sort(energySortFunction);

        return locations;
    }

}

module.exports = helperLocations;
