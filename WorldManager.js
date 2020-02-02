let MemoryAccessorClass = require('MemoryAccessor');

class WorldManager extends MemoryAccessorClass
{
    constructor() {
        super();

        this.roomManagers = {};
    }

    findExit(startRoomName, endRoomName) {
        let exitKey = startRoomName + endRoomName;
        let cachedExit = this.getFromMemory(exitKey);

        if (cachedExit !== undefined) {
            return cachedExit;
        }

        this.warn('Call to findExit has high CPU cost');
        let direction = Game.map.findExit(startRoomName, endRoomName);
        this.putIntoMemory(exitKey, direction);
        return direction;
    }

    getConstructionSites(roomName) {
        let roomManager = this.getRoomManager(roomName);
        return roomManager.getConstructionSites();
    }

    getContainers(roomName) {
        let roomManager = this.getRoomManager(roomName);
        return roomManager.getContainers();
    }

    getDroppedResources(roomName) {
        let roomManager = this.getRoomManager(roomName);
        return roomManager.getDroppedResources();
    }

    getEnergyAvailable(roomName) {
        let roomManager = this.getRoomManager(roomName);
        return roomManager.energyAvailable;
    }

    getExtensions(roomName) {
        let roomManager = this.getRoomManager(roomName);
        return roomManager.getExtensions(roomName);
    }

    getExtensionsByPosition(position) {
        let roomManager = this.getRoomManager(position.roomName);
        return roomManager.getExtensionsByPosition(position);
    }

    getFriendlySpawns(roomName) {
        let roomManager = this.getRoomManager(roomName);
        return roomManager.getFriendlySpawns();
    }

    getHarvestContainers(roomName) {
        let roomManager = this.getRoomManager(roomName);
        return roomManager.getHarvestContainers();
    }

    getHostileCreeps(roomName) {
        let roomManager = this.getRoomManager(roomName);
        return roomManager.getHostileCreeps();
    }

    getHostileCreepsWorldwide() {
        let creeps = [];
        let neighboringRoomNames = this.getNeighboringRoomNames();
        let roomManager;
        let neighboringCreeps;
        let idxNeighboringCreep;

        for (let idxRoom = 0; idxRoom < neighboringRoomNames.length; idxRoom++) {
            roomManager = this.getRoomManager(neighboringRoomNames[idxRoom]);
            neighboringCreeps = roomManager.getHostileCreeps();

            for (idxNeighboringCreep = 0; idxNeighboringCreep < neighboringCreeps.length; idxNeighboringCreep++) {
                creeps.push(neighboringCreeps[idxNeighboringCreep]);
            }
        }

        return creeps;
    }

    getInvaderCores() {
        let cores = [];
        let neighboringRoomNames = this.getNeighboringRoomNames();
        let roomManager;
        let neighboringCores;
        let idxNeighboringCore;

        for (let idxRoom = 0; idxRoom < neighboringRoomNames.length; idxRoom++) {
            roomManager = this.getRoomManager(neighboringRoomNames[idxRoom]);
            neighboringCores = roomManager.getInvaderCores();

            for (idxNeighboringCore = 0; idxNeighboringCore < neighboringCores.length; idxNeighboringCore++) {
                cores.push(neighboringCores[idxNeighboringCore]);
            }
        }

        return cores;
    }

    getNeighboringRoomNames() {
        let controlledRoomNames = [];

        for (let visibleRoomName in Game.rooms) {
            if (Game.rooms[visibleRoomName].controller.my) {
                controlledRoomNames.push(visibleRoomName);
            }
        }

        let neighboringRoomNames = [];
        let exits;

        controlledRoomNames.forEach(function(controlledRoomName) {
            exits = Game.map.describeExits(controlledRoomName);

            for (let exit in exits) {
                if (neighboringRoomNames.indexOf(exits[exit]) === -1) {
                    neighboringRoomNames.push(exits[exit]);
                }
            }
        });

        return neighboringRoomNames;
    }

    getObstacles(position) {
        let roomManager = this.getRoomManager(position.roomName);
        let obstacles = roomManager.getObstacles(position);

        // for (let creepName in Game.creeps) {
        //     if (Game.creeps[creepName].pos.isEqualTo(position)) {
        //         obstacles.push(Game.creeps[creepName]);
        //     }
        // }

        // this.debug('Obstacles at ' + position + ': ' + obstacles);
        return obstacles;
    }

    getRoomManager(roomName) {
        if (this.roomManagers.hasOwnProperty(roomName)) {
            // this.debug('Retrieving previously instantiated room manager for ' + roomName);
            return this.roomManagers[roomName];
        } else {
            // this.debug('Instantiating new room manager for ' + roomName);
            let RoomManagerClass = require('RoomManager');
            this.roomManagers[roomName] = new RoomManagerClass(roomName);
            return this.roomManagers[roomName];
        }
    }

    getRuins(roomName) {
        let roomManager = this.getRoomManager(roomName);
        return roomManager.getRuins();
    }

    getSources(roomName) {
        let roomManager = this.getRoomManager(roomName);
        return roomManager.getSources();
    }

    getStructures(roomName) {
        let roomManager = this.getRoomManager(roomName);
        return roomManager.getStructures();
    }

    getTombstones(roomName) {
        let roomManager = this.getRoomManager(roomName);
        return roomManager.getTombstones();
    }

    getTowers(roomName) {
        let roomManager = this.getRoomManager(roomName);
        return roomManager.getTowers();
    }

    isFullEnergy(roomName) {
        let roomManager = this.getRoomManager(roomName);
        return roomManager.isFullEnergy;
    }

    isWalkable(position) {
        let terrain = new Room.Terrain(position.roomName);

        if (terrain.get(position.x, position.y) === TERRAIN_MASK_WALL) {
            return false;
        }

        let obstacles = this.getObstacles(position);

        if (obstacles.length > 0) {
            this.debug(position + ' is not walkable because of these obstacles: ' + obstacles);
        }

        return obstacles.length === 0;
    }

    get isShowingDebugMessages() {
        return false;
    }

    get memoryKey() {
        return 'worldCache';
    }

    get name() {
        return 'WorldManager';
    }

}

module.exports = WorldManager;