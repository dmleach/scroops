class WorldManager
{
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
}

module.exports = WorldManager;