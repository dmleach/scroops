var helperBase = {

    // Bases should include a controller, a spawn, the energy sources
    // harvesters should target, and the containers spenders should favor
    baseFootprints: [
        {
            ul: new RoomPosition(28, 5, 'W32S23'),
            br: new RoomPosition(48, 18, 'W32S23'),
        },
    ],

    isBaseValid: function() {
        for (var idxFootprint in this.baseFootprints) {
            if (!Game.rooms[this.baseFootprints[idxFootprint].ul.roomName]) {
                if (Game.time % 10 == 0) {
                    console.log('Configuration in helper.base is not valid');
                }
            }
        }
    },

    isInBase: function(position) {
        for (var idxFootprint in this.baseFootprints) {
            var footprint = this.baseFootprints[idxFootprint];

            if (this.isInBaseFootprint(position, footprint)) {
                return true;
            }
        }

        return false;
    },

    isInBaseFootprint: function(position, footprint) {
        if (footprint.ul.roomName !== position.roomName) {
            return false;
        }

        if (footprint.ul.x > position.x) {
            return false;
        }

        if (footprint.ul.y > position.y) {
            return false;
        }

        if (footprint.br.roomName !== position.roomName) {
            return false;
        }

        if (footprint.br.x < position.x) {
            return false;
        }

        if (footprint.br.y < position.y) {
            return false;
        }

        return true;
    },

    isRoomFriendly: function (room) {
        if (!room.controller) {
            return false;
        }

        return room.controller.my;
    },
}

module.exports = helperBase;
