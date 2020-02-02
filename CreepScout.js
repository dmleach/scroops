let CreepAncestorClass = require('CreepAncestor');

class CreepScout extends CreepAncestorClass
{
    static get basicBody() {
        return [MOVE];
    }

    static canSpawn(roomName, worldManager, utilCreep) {
        return true;
    }

    getTakeEnergyTargetId(worldManager) {
        return undefined;
    }

    get isShowingDebugMessages() {
        return this.name === 'foo';
    }

    get mode() {
        return this.MODE_TAKE_ENERGY;
    }

    static numberToSpawn(worldManager, utilCreep) {
        let neighboringRoomNames = worldManager.getNeighboringRoomNames();

        if (neighboringRoomNames === undefined) {
            return 1;
        }

        return neighboringRoomNames.length;
    }

    takeEnergyWithUndefinedTarget(worldManager) {
        // let WorldManagerClass = require('WorldManager');
        // let neighboringRoomNames = WorldManagerClass.getNeighboringRoomNames();
        let neighboringRoomNames = worldManager.getNeighboringRoomNames();

        // If the creep is already in a neighboring room, there's no need to find a new position
        if (neighboringRoomNames.indexOf(this.pos.roomName) !== -1) {
            return undefined;
        }

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

        // let worldManager = new WorldManagerClass();
        let direction = worldManager.findExit(this.pos.roomName, destinationRoomName);

        let terrain = new Room.Terrain(this.pos.roomName);
        let roomExits = [];
        let idxRoomSection;
        let idxRoomPosition;

        if (direction === TOP) {
            for (idxRoomSection = 0; idxRoomSection < 50; idxRoomSection = idxRoomSection + 10) {
                for (idxRoomPosition = 0; idxRoomPosition < 10; idxRoomPosition++) {
                    if (terrain.get(idxRoomSection + idxRoomPosition, 0) !== TERRAIN_MASK_WALL) {
                        roomExits.push(new RoomPosition(idxRoomSection + idxRoomPosition, 0, this.pos.roomName));
                        break;
                    }
                }
            }
        } else if (direction === RIGHT) {
            for (idxRoomSection = 0; idxRoomSection < 50; idxRoomSection = idxRoomSection + 10) {
                for (idxRoomPosition = 0; idxRoomPosition < 10; idxRoomPosition++) {
                    if (terrain.get(49, idxRoomSection + idxRoomPosition) !== TERRAIN_MASK_WALL) {
                        roomExits.push(new RoomPosition(49, idxRoomSection + idxRoomPosition, this.pos.roomName));
                        break;
                    }
                }
            }
        } else if (direction === BOTTOM) {
            for (idxRoomSection = 0; idxRoomSection < 50; idxRoomSection = idxRoomSection + 10) {
                for (idxRoomPosition = 0; idxRoomPosition < 10; idxRoomPosition++) {
                    if (terrain.get(idxRoomSection + idxRoomPosition, 49) !== TERRAIN_MASK_WALL) {
                        roomExits.push(new RoomPosition(idxRoomSection + idxRoomPosition, 49, this.pos.roomName));
                        break;
                    }
                }
            }
        } else if (direction === LEFT) {
            for (idxRoomSection = 0; idxRoomSection < 50; idxRoomSection = idxRoomSection + 10) {
                for (idxRoomPosition = 0; idxRoomPosition < 10; idxRoomPosition++) {
                    if (terrain.get(0, idxRoomSection + idxRoomPosition) !== TERRAIN_MASK_WALL) {
                        roomExits.push(new RoomPosition(0, idxRoomSection + idxRoomPosition, this.pos.roomName));
                        break;
                    }
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
            path = utilPath.getPath(this.pos, roomExits[idxExit], worldManager);

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
        this.move(shortestPath[0].direction, worldManager);
    }
}

module.exports = CreepScout;