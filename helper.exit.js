var helperExit = {

    getDestination: function(position) {
        // exitDestination = new RoomPosition(0, 0, '');
        
        var adjacentRooms = Game.map.describeExits(position.roomName);

        if (position.x == 0) {
            return new RoomPosition(49, position.y, adjacentRooms[FIND_EXIT_LEFT]);
        } else if (position.x == 49) {
            return new RoomPosition(0, position.y, adjacentRooms[FIND_EXIT_RIGHT]);
        } else if (position.y == 0) {
            return new RoomPosition(position.x, 49, adjacentRooms[FIND_EXIT_TOP]);
        } else if (position.y == 49) {
            return new RoomPosition(position.x, 0, adjacentRooms[FIND_EXIT_BOTTOM]);
        }

    },

    isExit: function(position) {
        return (position.x == 0 || position.x == 49 || position.y == 0 || position.y == 49);
    }

}

module.exports = helperExit;
