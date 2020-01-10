var helperDistance = {

    getDistance: function(start, finish) {
        console.log('Calculating distance between ' + start + ' and ' + finish);

        // Get the path between the start and the finish
        var path = start.findPathTo(finish);

        // Check to see if the last step of the path involves leaving the room
        var lastStep = path[path.length - 1];
        var exitDestination = require('helper.exit').getDestination(new RoomPosition(lastStep.x, lastStep.y, start.roomName));
        console.log(exitDestination.x, exitDestination.y, exitDestination.roomName);
    }

}

module.exports = helperDistance;
