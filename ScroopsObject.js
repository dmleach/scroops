class ScroopsObject
{
    debug(message) {
        if (this.isShowingDebugMessages === false) {
            return;
        }

        console.log('[DEBUG] ' + this.name + ': ' + message);
    }

    directionName(direction) {
        let directionNames = {};
        directionNames[TOP_LEFT] = 'top left';
        directionNames[TOP] = 'top';
        directionNames[TOP_RIGHT] = 'top right';
        directionNames[LEFT] = 'left';
        directionNames[RIGHT] = 'right';
        directionNames[BOTTOM_LEFT] = 'bottom left';
        directionNames[BOTTOM] = 'bottom';
        directionNames[BOTTOM_RIGHT] = 'bottom right';

        return (direction in directionNames) ? directionNames[direction] : 'unknown';
    }

    error(errorCode, message = '') {
        if (this.isShowingErrorMessages === false) {
            return;
        }

        let UtilErrorClass = require('UtilError');
        message = '[ERROR ' + errorCode + ': ' + UtilErrorClass.getMessageFromCode(errorCode)  + '] ' + this.name + ': ' + message;

        console.log(message.replace(/:$/, ''));
    }

    findName(findCode) {
        let findNames = {};
        findNames[FIND_EXIT_TOP] = 'Exit top';
        findNames[FIND_EXIT_RIGHT] = 'Exit right';
        findNames[FIND_EXIT_BOTTOM] = 'Exit bottom';
        findNames[FIND_EXIT_LEFT] = 'Exit left';
        findNames[FIND_EXIT] = 'Exit';
        findNames[FIND_CREEPS] = 'Creeps';
        findNames[FIND_MY_CREEPS] = 'My creeps';
        findNames[FIND_HOSTILE_CREEPS] = 'Hostile creeps';
        findNames[FIND_SOURCES_ACTIVE] = 'Active sources';
        findNames[FIND_SOURCES] = 'Sources';
        findNames[FIND_DROPPED_RESOURCES] = 'Dropped resources';
        findNames[FIND_STRUCTURES] = 'Structures';
        findNames[FIND_MY_STRUCTURES] = 'My structures';
        findNames[FIND_HOSTILE_STRUCTURES] = 'Hostile structures';
        findNames[FIND_FLAGS] = 'Flags';
        findNames[FIND_CONSTRUCTION_SITES] = 'Construction sites';
        findNames[FIND_MY_SPAWNS] = 'My spawns';
        findNames[FIND_HOSTILE_SPAWNS] = 'Hostile spawns';
        findNames[FIND_MY_CONSTRUCTION_SITES] = 'My construction sites';
        findNames[FIND_HOSTILE_CONSTRUCTION_SITES] = 'Hostile construction sites';
        findNames[FIND_MINERALS] = 'Minerals';
        findNames[FIND_NUKES] = 'Nukes';
        findNames[FIND_TOMBSTONES] = 'Tombstones';
        findNames[FIND_POWER_CREEPS] = 'Power creeps';
        findNames[FIND_MY_POWER_CREEPS] = 'My power creeps';
        findNames[FIND_HOSTILE_POWER_CREEPS] = 'Hostile power creeps';
        findNames[FIND_DEPOSITS] = 'Deposits';
        findNames[FIND_RUINS] = 'Ruins';

        return (findCode in findNames) ? findNames[findCode] : 'unknown';
    }

    getDirectionsOutFrom(direction) {
        let directions = [direction, direction - 1, direction + 1, direction - 2, direction + 2, direction - 3, direction + 3, direction - 4];

        for (let idxDirection = 0; idxDirection < directions.length; idxDirection++) {
            if (directions[idxDirection] < 1) {
                directions[idxDirection] = directions[idxDirection] + 8;
            } else if (directions[idxDirection] > 8) {
                directions[idxDirection] = directions[idxDirection] - 8;
            }
        }

        return directions;
    }

    getPathDestination(position, path) {
        if ( (position instanceof RoomPosition) === false) {
            return undefined;
        }

        if ( (path instanceof Array) === false) {
            return undefined;
        }

        if (path.length === 0) {
            return position;
        }

        let deltaX = 0;
        let deltaY = 0;

        for (let idxPath = 0; idxPath < path; idxPath++) {
            if ([LEFT, TOP_LEFT, BOTTOM_LEFT].indexOf(path[idxPath]) !== -1) {
                deltaX -= 1;
            }

            if ([RIGHT, TOP_RIGHT, BOTTOM_RIGHT].indexOf(path[idxPath]) !== -1) {
                deltaX += 1;
            }

            if ([TOP, TOP_LEFT, TOP_RIGHT].indexOf(path[idxPath]) !== -1) {
                deltaY -= 1;
            }

            if ([BOTTOM, BOTTOM_LEFT, BOTTOM_RIGHT].indexOf(path[idxPath]) !== -1) {
                deltaY += 1;
            }

            if (position.x + deltaX < 0 || position.x + deltaX > 49) {
                return undefined;
            }

            if (position.y + deltaY < 0 || position.y + deltaY > 49) {
                return undefined;
            }
        }

        return new RoomPosition(position.x + deltaX, position.y + deltaY, position.roomName);
    }

    get isShowingDebugMessages() {
        return false;
    }

    get isShowingErrorMessages() {
        return true;
    }

    get isShowingWarningMessages() {
        return true;
    }

    warn(message) {
        if (this.isShowingWarningMessages === false) {
            return;
        }

        console.log('[WARNING] ' + this.name + ': ' + message);
    }
}

module.exports = ScroopsObject;