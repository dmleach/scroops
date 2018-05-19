class RoomHelper {

    /**
     * Returns all the non-friendly rooms that are adjacent to friendly rooms
     */
    static get adjacentRooms() {
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
        let route = Game.map.findRoute(position.roomName, roomName);

        if (route.length !== 1) {
            throw new Error('Rooms given to getDirectionToRoom are not adjacent');
        }

        return route[0].exit;
    }

    static isAdjacent(roomNameA, roomNameB) {
        let exits = Game.map.describeExits(roomNameA);

        for (let idxExit in exits) {
            if (exits[idxExit] == roomNameB) {
                return true;
            }
        }

        return false;
    }

    static isFriendly(roomName) {
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

}

module.exports = RoomHelper;
