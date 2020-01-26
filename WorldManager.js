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

    static getNeighboringRoomNames() {
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

    getRoomManager(roomName) {
        let roomManager;

        if (this.roomManagers.hasOwnProperty(roomName)) {
            roomManager = this.roomManagers[roomName];
        } else {
            let RoomManagerClass = require('RoomManager');
            roomManager = new RoomManagerClass(roomName);
            this.roomManagers[roomName] = roomManager;
        }

        return roomManager;
    }

    get memoryKey() {
        return 'worldCache';
    }

    get name() {
        return 'WorldManager';
    }

}

module.exports = WorldManager;