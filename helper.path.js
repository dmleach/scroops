class PathHelper {

    static find(start, end) {
        let path = this.readFromCache(start, end);

        if (path) {
            return path;
        }

        path = start.findPathTo(end, { ignoreCreeps: true });
        this.writeToCache(start, end, path);

        return path;
    }

    static readFromCache(start, end) {
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
