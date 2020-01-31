let MemoryAccessorClass = require('MemoryAccessor');

class UtilPath extends MemoryAccessorClass
{
    _cachePathUsingArrays(startPosition, endPosition, path) {
        let cacheKeyArray = [this.memoryKeyUsingArrays].concat(this._getCacheKeyArray(startPosition).concat(this._getCacheKeyArray(endPosition)));
        let pathString = this._getPathStringFromPath(path);
        this.putIntoMemoryUsingArray(cacheKeyArray, pathString);
    }

    _getCacheKeyArray(position) {
        return [position.roomName, position.x.toString(), position.y.toString()];
    }

    _getPathStringFromCacheUsingArrays(startPosition, endPosition) {
        let cacheKeyArray = [this.memoryKeyUsingArrays].concat(this._getCacheKeyArray(startPosition).concat(this._getCacheKeyArray(endPosition)));
        return this.getFromMemoryUsingArray(cacheKeyArray);
    }

    get isShowingDebugMessages() {
        return true;
    }

    get memoryKey() {
        return 'pathCache';
    }

    get memoryKeyUsingArrays() {
        return this.name;
    }

    getPath(startPosition, endPosition, worldManager) {
        let pathString = this._getPathStringFromCacheUsingArrays(startPosition, endPosition);

        if (pathString !== undefined) {
            return this._getPathFromPathString(pathString);
        }

        if (worldManager.isWalkable(endPosition) === false) {
            this.debug('Not returning a path to ' + endPosition + ' because it is unwalkable');
            return undefined;
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