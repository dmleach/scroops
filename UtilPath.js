let MemoryAccessorClass = require('MemoryAccessor');

class UtilPath extends MemoryAccessorClass
{
    _cachePath(startPosition, endPosition, path) {
        let cacheKey = this._getCacheKey(startPosition) + this._getCacheKey(endPosition);
        let pathString = this._getPathStringFromPath(path);
        this.putIntoMemory(cacheKey, pathString);
    }

    _cachePathUsingArrays(startPosition, endPosition, path) {
        let cacheKeyArray = [this.memoryKeyUsingArrays].concat(this._getCacheKeyArray(startPosition).concat(this._getCacheKeyArray(endPosition)));
        let pathString = this._getPathStringFromPath(path);
        this.putIntoMemoryUsingArray(cacheKeyArray, pathString);
    }

    _getCacheKey(position) {
        return position.x.toString().padStart(3, '0') + position.y.toString().padStart(3, '0') + position.roomName;
    }

    _getCacheKeyArray(position) {
        return [position.roomName, position.x.toString(), position.y.toString()];
    }

    _getPathStringFromCache(startPosition, endPosition) {
        let cacheKey = this._getCacheKey(startPosition) + this._getCacheKey(endPosition);
        return this.getFromMemory(cacheKey);
    }

    _getPathStringFromCacheUsingArrays(startPosition, endPosition) {
        let cacheKeyArray = [this.memoryKeyUsingArrays].concat(this._getCacheKeyArray(startPosition).concat(this._getCacheKeyArray(endPosition)));
        return this.getFromMemoryUsingArray(cacheKeyArray);
    }

    get memoryKey() {
        return 'pathCache';
    }

    get memoryKeyUsingArrays() {
        return this.name;
    }

    // getPath(startPosition, endPosition) {
    //     let pathString = this._getPathStringFromCache(startPosition, endPosition);
    //
    //     if (pathString !== undefined) {
    //         return this._getPathFromPathString(pathString);
    //     }
    //
    //     this.debug('Could not find path between ' + startPosition + ' and ' + endPosition + ' in cache');
    //     this.warn('Call to findPathTo has high CPU cost');
    //     let path = startPosition.findPathTo(endPosition, { ignoreCreeps: true });
    //     this._cachePath(startPosition, endPosition, path);
    //     // let pathfindingResult = PathFinder.search(startPosition, endPosition);
    //     // console.log('Path is ' + pathfindingResult.path);
    //     // console.log('Incomplete? ' + pathfindingResult.incomplete);
    //     // this._cachePath(startPosition, endPosition, pathfindingResult.path);
    //     // return pathfindingResult['path'];
    // }

    getPath(startPosition, endPosition) {
        let pathString = this._getPathStringFromCacheUsingArrays(startPosition, endPosition);

        if (pathString !== undefined) {
            return this._getPathFromPathString(pathString);
        }

        this.warn('Call to findPathTo has high CPU cost (' + startPosition + ' to ' + endPosition + ')');
        let path = startPosition.findPathTo(endPosition, { ignoreCreeps: true });
        this._cachePathUsingArrays(startPosition, endPosition, path);

        return path;
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

    get name() {
        return 'UtilPath';
    }


}

module.exports = UtilPath;