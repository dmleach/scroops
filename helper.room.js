const ROOM_STATUS_LIFESPAN = 500;

let BaseClass = require('class.base');

class RoomHelper extends BaseClass {

    static get ROOM_STATUS_FRIENDLY() { return 'Friendly'; }
    static get ROOM_STATUS_HOSTILE() { return 'Hostile'; }
    static get ROOM_STATUS_NEUTRAL() { return 'Neutral'; }

    /**
     * Returns all the non-friendly rooms that are adjacent to friendly rooms
     */
    static get adjacentRooms() {
        this.incrementProfilerCount('RoomHelper.adjacentRooms');

        let adjacentRooms = [];

        for (let roomName in Game.rooms) {
            if (this.isFriendly(roomName)) {
                let exits = Game.map.describeExits(roomName);

                for (let idxExit in exits) {
                    let adjacentRoom = exits[idxExit];

                    if (adjacentRooms.indexOf(adjacentRoom) == -1) {
                        if (this.isFriendly(adjacentRoom) == false) {
                            adjacentRooms.push(adjacentRoom);
                        }
                    }
                }
            }
        }

        return adjacentRooms;
    }

    static findExits(roomName, directions) {
        this.incrementProfilerCount('RoomHelper.findExits');

        let room = Game.rooms[roomName];

        if (!room) {
            throw new Error('Room name ' + roomName + ' given to findExits is invalid');
        }

        if (Array.isArray(directions) == false) {
            directions = [directions];
        }

        if (directions.length == 0) {
            return room.find(FIND_EXIT);
        }

        let exits = [];
        let validDirections = [FIND_EXIT_TOP, FIND_EXIT_RIGHT, FIND_EXIT_BOTTOM, FIND_EXIT_LEFT];

        for (let idxDirection in directions) {
            if (validDirections.indexOf(directions[idxDirection]) !== -1) {
                let roomExits = room.find(directions[idxDirection]);
                exits = exits.concat(roomExits);
            }
        }

        return exits;
    }

    static getDirectionToRoom(position, roomName) {
        this.incrementProfilerCount('RoomHelper.getDirectionToRoom');

        let route = Game.map.findRoute(position.roomName, roomName);

        if (route.length !== 1) {
            throw new Error('Rooms given to getDirectionToRoom are not adjacent');
        }

        return route[0].exit;
    }

    static getStatus(roomName) {
        this.incrementProfilerCount('RoomHelper.getStatus');

        // First check to see if the room is friendly
        if (this.isFriendly(roomName)) {
            return this.ROOM_STATUS_FRIENDLY;
        }

        if (!Memory.roomStatus) {
            return undefined;
        }

        let roomStatus = Memory.roomStatus[roomName];

        if (!roomStatus) {
            return undefined;
        }

        if (!roomStatus['status']) {
            return undefined;
        }

        if (!roomStatus['timestamp']) {
            return undefined;
        }

        if (Game.time > roomStatus['timestamp'] + ROOM_STATUS_LIFESPAN) {
            return undefined;
        }

        return roomStatus['status'];
    }

    static isAdjacent(roomNameA, roomNameB) {
        this.incrementProfilerCount('RoomHelper.isAdjacent');

        let exits = Game.map.describeExits(roomNameA);

        for (let idxExit in exits) {
            if (exits[idxExit] == roomNameB) {
                return true;
            }
        }

        return false;
    }

    static isFriendly(roomName) {
        this.incrementProfilerCount('RoomHelper.isFriendly');

        let room = Game.rooms[roomName];

        if (!room) {
            return false;
        }

        if (!room.controller) {
            return false;
        }

        if (!room.controller.my) {
            return false;
        }

        return true;
    }

    static isHostile(roomName) {
        this.incrementProfilerCount('RoomHelper.isHostile');

        let hostileStatuses = [this.ROOM_STATUS_HOSTILE];
        return hostileStatuses.indexOf(this.getStatus(roomName)) !== -1;
    }

    static setStatus(roomName, status) {
        this.incrementProfilerCount('RoomHelper.setStatus');

        if (!Memory.roomStatus) {
            Memory.roomStatus = {}
        }

        let roomStatus = {};
        roomStatus['status'] = status;
        roomStatus['timestamp'] = Game.time;

        Memory.roomStatus[roomName] = roomStatus;
    }

}

module.exports = RoomHelper;
