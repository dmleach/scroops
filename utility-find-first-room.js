class UtilityAnalyzeRoom
{
    static get availableRoomNames() {
        let worldSize = Game.map.getWorldSize();
        let maximumCoordinate = (worldSize - 2) / 2;
        let availableRoomNames = [];

        Array.prototype.pushRoomIfAvailable = function(roomName) {
            if (Game.map.isRoomAvailable(roomName)) {
                this.push(roomName);
            }
        };

        let roomName;

        for (let idxHorizontal = 0; idxHorizontal <= maximumCoordinate; idxHorizontal++) {
            for (let idxVertical = 0; idxVertical <= maximumCoordinate; idxVertical++) {
                availableRoomNames.pushRoomIfAvailable(roomName = "E" + idxHorizontal + "N" + idxVertical);
                availableRoomNames.pushRoomIfAvailable(roomName = "E" + idxHorizontal + "S" + idxVertical);
                availableRoomNames.pushRoomIfAvailable(roomName = "W" + idxHorizontal + "N" + idxVertical);
                availableRoomNames.pushRoomIfAvailable(roomName = "W" + idxHorizontal + "S" + idxVertical);
            }
        }

        return availableRoomNames;
    }

    static get controllableRoomNames() {
        if (Memory.controllableRoomNames !== undefined) {
            
        }

        let availableRoomNames = this.availableRoomNames;
        let room;

        Array.prototype.pushRoomIfControllable = function(roomName) {
            room = Game.rooms[roomName];

            if (room.controller !== undefined) {
                this.push(roomName);
            }
        };

        let controllableRoomNames = [];

        availableRoomNames.forEach(function(roomName) {
            controllableRoomNames.pushRoomIfControllable(roomName);
        });

        return controllableRoomNames;
    }
}

console.log('The world has ' + UtilityAnalyzeRoom.availableRoomNames.length + ' available rooms');
console.log('The world has ' + UtilityAnalyzeRoom.controllableRoomNames.length + ' available and controllable rooms');