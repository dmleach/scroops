var roleScout = {

    doPlan: function(creep) {
        // Find the existing scouts
        var helperCreeps = require('helper.creeps');
        var scouts = helperCreeps.find(require('profile.scout'));

        // Look for all the exits in friendly rooms
        exits = [];
        var helperBase = require('helper.base');

        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];

            if (helperBase.isRoomFriendly(room)) {
                exits = exits.concat(room.find(FIND_EXIT));
            }
        }

        // Calculate where those exits lead
        var destinations = [];
        var helperObstacles = require('helper.obstacles');

        for (var idxExit in exits) {
            var exit = exits[idxExit];

            if (helperObstacles.isSpaceOpen(exit)) {
                var exitDestination = new RoomPosition(0, 0, exit.roomName);
                var adjacentRooms = Game.map.describeExits(exit.roomName);

                if (exit.x == 0) {
                    exitDestination.roomName = adjacentRooms[FIND_EXIT_LEFT];
                    exitDestination.x = 48;
                    exitDestination.y = exit.y;
                } else if (exit.x == 49) {
                    exitDestination.roomName = adjacentRooms[FIND_EXIT_RIGHT];
                    exitDestination.x = 1;
                    exitDestination.y = exit.y;
                } else if (exit.y == 0) {
                    exitDestination.roomName = adjacentRooms[FIND_EXIT_TOP];
                    exitDestination.x = exit.x;
                    exitDestination.y = 48;
                } else if (exit.y == 49) {
                    exitDestination.roomName = adjacentRooms[FIND_EXIT_BOTTOM];
                    exitDestination.x = exit.x;
                    exitDestination.y = 1;
                }

                // If there's not a scout in the room, it's a potential destination
                var ignoreRoom = false;

                for (var idxScout in scouts) {
                    var scout = scouts[idxScout];

                    if (scout.room.name == exitDestination.roomName) {
                        ignoreRoom = true;
                    }
                }

                if (!ignoreRoom) {
                    destinations.push(exitDestination);
                }
            }
        }


        // Find the closest destination to the creep
        var closestDestination = false;
        var closestDestinationDistance = Infinity;

        for (var idxDestination = 0; idxDestination < destinations.length; idxDestination++) {
            var destination = destinations[idxDestination];
            var destinationDistance = creep.pos.findPathTo(destination).length;

            if (destinationDistance < closestDestinationDistance) {
                closestDestination = destination;
                closestDestinationDistance = destinationDistance;
            }
        }

        if (closestDestination) {
            creep.memory.destination = {
                x: closestDestination.x,
                y: closestDestination.y,
                roomName: closestDestination.roomName,
            }
        }
    },

    doTravel: function(creep) {
        var moveResult = creep.moveTo(this.getDestinationPosition(creep));

        if (moveResult == ERR_NO_PATH) {
            creep.memory.destination = undefined;
        }
    },

    getActivity: function(creep) {
        if (!creep.memory.destination) {
            return 'Plan';
        }

        if (creep.pos.isEqualTo(this.getDestinationPosition(creep))) {
            return 'Observe';
        }

        return 'Travel';
    },

    getClosestExit: function(creep) {
        var darkRooms = this.getAdjacentDarkRooms(creep);

        if (darkRooms.length == 0) {
            return false;
        }

        var closestExit = false;
        var closestExitDistance = Infinity;

        for (var idxRoom = 0; idxRoom < darkRooms.length; idxRoom++) {
            var route = Game.map.findRoute(creep.room, darkRooms[idxRoom]);

            if (route.length > 0) {
                var exits = creep.room.find(route[0].exit);

                for (var idxExit = 0; idxExit < exits.length; idxExit++) {
                    var exit = exits[idxExit];
                    var exitDistance = creep.pos.findPathTo(exit).length;

                    if (closestExit == false || exitDistance < closestExitDistance) {
                        closestExit = exit;
                        closestExitDistance = exitDistance;
                    }
                }
            }
        }

        return closestExit;
    },

    getDestinationPosition: function(creep) {
        if (!creep.memory.destination) {
            return false;
        }

        return new RoomPosition(
            creep.memory.destination.x,
            creep.memory.destination.y,
            creep.memory.destination.roomName
        );
    },

    /**
      * @param {Creep} creep
     **/
    run: function(creep, helperLocations = undefined) {
        creep.memory.activity = this.getActivity(creep);

        if (creep.memory.activity == 'Plan') {
            this.doPlan(creep);
        } else if (creep.memory.activity == 'Travel') {
            this.doTravel(creep);
        }
	}
};

module.exports = roleScout;
