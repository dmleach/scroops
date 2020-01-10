var helperPath = {

    findPath: function(startPosition, endPosition) {
        // console.log('Finding path from ' + startPosition + ' to ' + endPosition);
        //
        // try {
        //     var path = startPosition.findPathTo(endPosition);
        // } catch(err) {
        //     return false;
        // }
        //
        // for (var idxPath in path) {
        //     var step = path[idxPath];
        //     step.pos = new RoomPosition(step.x, step.y, startPosition.roomName);
        // }
        //
        // var helperExit = require('helper.exit');
        //
        // if (helperExit.isExit(path[path.length - 1].pos)) {
        //     path.push({ pos: helperExit.getDestination(path[path.length - 1].pos) });
        //     path.push(this.findPath(path[path.length - 1].pos), endPosition);
        // }
        //
        // return path;

        console.log('Looking for path from ' + startPosition + ' to ' + endPosition);

        var foundPaths = PathFinder.search(startPosition, endPosition);
        var shortestPath = false;
        var shortestPathCost = Infinity;

        for (var idxPath in foundPaths) {
            console.log('Index of foundPaths is ' + idxPath);
            console.log('Value at index is ' + foundPaths[idxPath]);
        }

        for (var idxPath in foundPaths) {
            var foundPath = foundPaths[idxPath];
            console.log('Path cost is ' + foundPath[1]);


            if (foundPath.cost < shortestPathCost) {
                shortestPath = foundPath.path;
                shortestPathCost = foundPath.cost;
            }
        }

        console.log('Shortest path is ' + shortestPath);
        return shortestPath;
    },

}

module.exports = helperPath;
