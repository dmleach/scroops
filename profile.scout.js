var profileScout = {

    active: true,
    baseBody: [MOVE],

    /** @param {Room} room **/
    body: function(room) {
        return this.baseBody;
    },

    creepName: 'Scout',
    creepType: 7,
    desiredCount: 1,
    energyType: 'Earner',
    renewable: false,
    roleScript: 'role.scout',

    shouldSpawn: function(spawn, helperLocations) {
        var helperCreeps = require('helper.creeps');
        var profiles = require('helper.profiles');
        var scoutCount = helperCreeps.count(profiles.scout);

        // Find all the rooms adjoining friendly rooms
        var adjoiningRooms = [];
        var helperBase = require('helper.base');
        var helperExit = require('helper.exit');

        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            var exits = [];

            if (helperBase.isRoomFriendly(room)) {
                exits = room.find(FIND_EXIT);
            }

            for (var idxExit in exits) {
                var adjoiningRoom = helperExit.getDestination(exits[idxExit]);

                if (adjoiningRooms.indexOf(adjoiningRoom.roomName) == -1) {
                    adjoiningRooms.push(adjoiningRoom.roomName);
                }
            }
        }

        return scoutCount < adjoiningRooms.length;
    },

    spawnGroup: 1,

}

module.exports = profileScout;
