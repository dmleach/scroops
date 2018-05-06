class PathHelper {

    static find(start, end) {
        if (!start) {
            throw new Error('Start position must be supplied to find');
        }

        if (!end) {
            throw new Error('End position must be supplied to find');
        }

        let path;

        try {
            path = this.readFromCache(start, end);
        } catch(error) {
            path = undefined;
        }

        if (path) {
            return path;
        }

        path = start.findPathTo(end, { ignoreCreeps: true });
        this.writeToCache(start, end, path);

        return path;
    }

    static readFromCache(start, end) {
        if (!start) {
            throw new Error('Start position must be supplied to readFromCache');
        }

        if (!end) {
            throw new Error('End position must be supplied to readFromCache');
        }

        if (!Memory.pathResults) {
            return undefined;
        }

        if (!Memory.pathResults[start.x]) {
            return undefined;
        }

        if (!Memory.pathResults[start.x][start.y]) {
            return undefined;
        }

        if (!Memory.pathResults[start.x][start.y][end.x]) {
            return undefined;
        }

        return Memory.pathResults[start.x][start.y][end.x][end.y];
    }

    static writeToCache(start, end, path) {
        if (!start) {
            throw new Error('Start position must be supplied to writeToCache');
        }

        if (!end) {
            throw new Error('End position must be supplied to writeToCache');
        }

        if (!Memory.pathResults) {
            Memory.pathResults = {};
        }

        if (!Memory.pathResults[start.x]) {
            Memory.pathResults[start.x] = {};
        }

        if (!Memory.pathResults[start.x][start.y]) {
            Memory.pathResults[start.x][start.y] = {};
        }

        if (!Memory.pathResults[start.x][start.y][end.x]) {
            Memory.pathResults[start.x][start.y][end.x] = {};
        }

        if (!Memory.pathResults[start.x][start.y][end.x][end.y]) {
            Memory.pathResults[start.x][start.y][end.x][end.y] = {};
        }

        Memory.pathResults[start.x][start.y][end.x][end.y] = path;
    }

}

module.exports = PathHelper;
