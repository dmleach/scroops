let MemoryAccessorClass = require('MemoryAccessor');

class UtilPath extends MemoryAccessorClass
{
    _cachePathUsingArrays(startPosition, endPosition, path) {
        let cacheKeyArray = [this.memoryKeyUsingArrays].concat(this._getCacheKeyArray(startPosition).concat(this._getCacheKeyArray(endPosition)));
        let pathString = this.getPathStringFromPath(path);
        this.putIntoMemory(cacheKeyArray, pathString);
    }

    _getCacheKeyArray(position) {
        return [position.roomName, position.x.toString(), position.y.toString()];
    }

    _getPathStringFromCacheUsingArrays(startPosition, endPosition) {
        let cacheKeyArray = [this.memoryKeyUsingArrays].concat(this._getCacheKeyArray(startPosition).concat(this._getCacheKeyArray(endPosition)));
        return this.getFromMemory(cacheKeyArray);
    }

    get isShowingDebugMessages() {
        return true;
    }

    get memoryKey() {
        return this.name;
    }

    get memoryKeyUsingArrays() {
        return this.name;
    }

    getPath(startPosition, endPosition, worldManager) {
        let pathString = this.getPathString(startPosition, endPosition);

        if (pathString !== undefined) {
            return this.getPathFromPathString(pathString);
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

    getPathUpdateFunctionVersion(startPosition, endPosition) {
        let pathString = this.getPathString(startPosition, endPosition);

        if (pathString !== undefined) {
            let path = this.getPathFromPathString(pathString);
            return path;
        }

        this.warn('Call to findPathTo has high CPU cost (' + startPosition + ' to ' + endPosition + ')');
        let path = startPosition.findPathTo(endPosition, { ignoreCreeps: true });
        this._cachePathUsingArrays(startPosition, endPosition, path);

        return path;
    }

    getPathFromPathString(pathString) {
        if (typeof pathString !== 'string') {
            this.warn('getPathFromPathString requires a string; received a ' + typeof pathString);
            return undefined;
        }

        let path = [];

        if (pathString.length === 0) {
            return path;
        }

        let pathStep;

        for (let idxPathString = 0; idxPathString < pathString.length; idxPathString++) {
            pathStep = pathString[idxPathString];
            path.push({ direction: parseInt(pathStep) });
        }

        return path;
    }

    getPathString(startPosition, endPosition) {
        return this._getPathStringFromCacheUsingArrays(startPosition, endPosition);
    }

    getPathStringFromPath(path) {
        let pathString = '';

        if (path === undefined || path.length === 0) {
            return pathString;
        }

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