var helperRoute = {

    getRouteToNearestFriendlyRoom: function(position) {
        var helperBase = require('helper.base');

        if (helperBase.isRoomFriendly(position.roomName)) {
            return true;
        }

        var shortestRoute = false;
        var shortestRouteLength = Infinity;

        for (var idxRoom in Game.rooms) {
            var route = Game.map.findRoute(position.roomName, Game.rooms[idxRoom]);

            if (route.length < shortestRouteLength) {
                shortestRoute = route;
                shortestRouteLength = route.length;
            }
        }

        return shortestRoute;
    },

}

module.exports = helperRoute;
