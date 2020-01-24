let CreepAncestorClass = require('CreepAncestor');

class CreepScout extends CreepAncestorClass
{
    static get basicBody() {
        return [MOVE];
    }

    static canSpawn(roomManager, utilCreep) {
        return true;
    }

    getTakeEnergyTargetId(roomManager) {
        return undefined;
    }

    get isShowingDebugMessages() {
        return false;
    }

    get mode() {
        return this.MODE_TAKE_ENERGY;
    }

    static numberToSpawn(utilCreep) {
        let WorldManagerClass = require('WorldManager');
        let neighboringRoomNames = WorldManagerClass.getNeighboringRoomNames();

        if (neighboringRoomNames === undefined) {
            return 1;
        }

        return neighboringRoomNames.length;
    }

    takeEnergyWithUndefinedTarget() {
        let WorldManagerClass = require('WorldManager');
        let neighboringRoomNames = WorldManagerClass.getNeighboringRoomNames();
        let destinationRoomName = undefined;

        for (let idxNeighboringRoomName = 0; idxNeighboringRoomName < neighboringRoomNames.length; idxNeighboringRoomName++) {
            if (Game.rooms[neighboringRoomNames[idxNeighboringRoomName]] === undefined) {
                destinationRoomName = neighboringRoomNames[idxNeighboringRoomName];
                break;
            }
        }

        if (destinationRoomName === undefined) {
            return;
        }

        let worldManager = new WorldManagerClass();
        let direction = worldManager.findExit(this.pos.roomName, destinationRoomName);

        let terrain = new Room.Terrain(this.pos.roomName);
        let roomExits = [];
        let idxRoomPosition;

        if (direction === TOP) {
            for (idxRoomPosition = 0; idxRoomPosition < 50; idxRoomPosition++) {
                if (terrain.get(idxRoomPosition, 0) !== TERRAIN_MASK_WALL) {
                    roomExits.push(new RoomPosition(idxRoomPosition, 0, this.pos.roomName));
                }
            }
        } else if (direction === RIGHT) {
            for (idxRoomPosition = 0; idxRoomPosition < 50; idxRoomPosition++) {
                if (terrain.get(49, idxRoomPosition) !== TERRAIN_MASK_WALL) {
                    roomExits.push(new RoomPosition(49, idxRoomPosition, this.pos.roomName));
                }
            }
        }

        this.debug('Exits from this room are ' + roomExits);

        let shortestPath = undefined;
        let path;
        let UtilPathClass = require('UtilPath');
        let utilPath = new UtilPathClass();

        for (let idxExit = 0; idxExit < roomExits.length; idxExit++) {
            // path = this.pos.findPathTo(roomExits[idxExit]);
            path = utilPath.getPath(this.pos, roomExits[idxExit]);

            if (path === undefined || path.length === 0) {
                continue;
            }

            if (shortestPath === undefined || shortestPath.length > path.length) {
                shortestPath = path;
            }
        }

        // for (let idxPath = 0; idxPath < shortestPath.length; idxPath++) {
        //     this.debug('The path to the closest exit is ' + shortestPath[idxPath].direction);
        // }
        if (shortestPath === undefined) {
            this.debug('Could not find a shortest path');
            return;
        }

        this.debug('The first step in the path is ' + shortestPath[0]);
        this.move(shortestPath[0].direction);
    }
}

module.exports = CreepScout;