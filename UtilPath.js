let MemoryAccessorClass = require('MemoryAccessor');

class UtilPath extends MemoryAccessorClass
{
    _cachePath(startPosition, endPosition, path) {
        let cacheKey = this._getCacheKey(startPosition) + this._getCacheKey(endPosition);
        let pathString = this._getPathStringFromPath(path);
        this.putIntoMemory(cacheKey, pathString);
    }

    _getCacheKey(position) {
        return position.x.toString().padStart(3, '0') + position.y.toString().padStart(3, '0') + position.roomName;
    }

    _getPathStringFromCache(startPosition, endPosition) {
        let cacheKey = this._getCacheKey(startPosition) + this._getCacheKey(endPosition);
        return this.getFromMemory(cacheKey);
    }

    get memoryKey() {
        return 'pathCache';
    }

    getPath(startPosition, endPosition) {
        let pathString = this._getPathStringFromCache(startPosition, endPosition);

        if (pathString !== undefined) {
            return this._getPathFromPathString(pathString);
        }

        console.log('Could not find path between ' + startPosition + ' and ' + endPosition + ' in cache');
        let path = startPosition.findPathTo(endPosition, { ignoreCreeps: true });
        this._cachePath(startPosition, endPosition, path);
        // let pathfindingResult = PathFinder.search(startPosition, endPosition);
        // console.log('Path is ' + pathfindingResult.path);
        // console.log('Incomplete? ' + pathfindingResult.incomplete);
        // this._cachePath(startPosition, endPosition, pathfindingResult.path);
        // return pathfindingResult['path'];
    }

    _getPathFromPathString(pathString) {
        let path = [];
        let pathStep;

        for (let idxPathString = 0; idxPathString < pathString.length; idxPathString++) {
            pathStep = pathString.charAt(idxPathString);
            path.push({ direction: parseInt(pathStep) });
        }

        return path;
    }

    _getPathStringFromPath(path) {
        let pathString = '';

        for (let idxPath = 0; idxPath < path.length; idxPath++) {
            pathString += path[idxPath].direction.toString();
        }

        return pathString;
    }
}

module.exports = UtilPath;