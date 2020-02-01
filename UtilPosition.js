let MemoryAccessorClass = require('MemoryAccessor')

class UtilPosition extends MemoryAccessorClass
{
    constructor() {
        super();

        this.obstacles = {};
    }

    _getPositionsInRange(position, range) {
        let positions = [];

        if (position === undefined) {
            return positions;
        }

        for (let idxX = position.x - range; idxX <= position.x + range; idxX++) {
            if (idxX < 0 || idxX > 49) {
                continue;
            }

            for (let idxY = position.y - range; idxY <= position.y + range; idxY++) {
                if (idxY < 0 || idxY > 49) {
                    continue;
                }

                positions.push(new RoomPosition(idxX, idxY, position.roomName));
            }
        }

        return positions;
    }

    getClosestPositionInRange(startPosition, endPosition, range, worldManager) {
        let positionsInRange = this._getPositionsInRange(endPosition, range);
        let closestPosition = undefined;
        let positionInRange;

        for (let idxPosition = 0; idxPosition < positionsInRange.length; idxPosition++) {
            positionInRange = positionsInRange[idxPosition];

            if (positionInRange.isEqualTo(startPosition)) {
                return startPosition;
            }

            if (worldManager.isWalkable(positionInRange)) {
                if (closestPosition === undefined) {
                    closestPosition = positionInRange;
                } else if (this.getRange(startPosition, positionInRange) < this.getRange(startPosition, closestPosition)) {
                    closestPosition = positionInRange;
                }
            }
        }

        return closestPosition;
    }

    getClosestInteractionPosition(position, id) {
        if (position === undefined || id === undefined) {
            return undefined;
        }

        let gameObject = Game.getObjectById(id);

        if (gameObject === undefined) {
            return undefined;
        }

        if (gameObject instanceof StructureWall || gameObject instanceof ConstructionSite || gameObject instanceof StructureController) {
            return this.getClosestPositionInRange(position, gameObject.pos, 3);
        }

        return this.getClosestPositionInRange(position, gameObject.pos, 1);
    }

    getClosestInteractionPositionByCreepAndObject(creepId, gameObjectId) {
        if (creepId === undefined || gameObjectId === undefined) {
            return undefined;
        }

        let Role = require('Role');
        let creepClass = Role.getCreepClassByCreepId(creepId);

        if (creepClass === undefined) {
            creepClass = require('CreepAncestor');
        }

        let creep = new creepClass(creepId);

        if (creep === undefined || creep === null) {
            return undefined;
        }

        if (creepId === gameObjectId) {
            return creep.pos;
        }

        let gameObject = Game.getObjectById(gameObjectId);

        if (gameObject === undefined || gameObject === null) {
            creep.debug('Game object ' + gameObjectId + ' is undefined in getClosestInteractionPositionByCreepAndObject');
            return undefined;
        }

        return this.getClosestPositionInRange(creep.pos, gameObject.pos, creep.getInteractionRange(gameObject.id));
    }

    getCreepIdByPosition(position) {
        let creepId = undefined;

        for (let creepName in Game.creeps) {
            if (Game.creeps[creepName].pos.isEqualTo(position)) {
                creepId = Game.creeps[creepName].id;
            }
        }

        return creepId;

        // this.warn('Call to look in getCreepIdByPosition has high CPU cost');
        // let seenObjects = position.look();
        //
        // for (let idxObject = 0; idxObject < seenObjects.length; idxObject++) {
        //     if (seenObjects[idxObject].type === 'creep') {
        //         return seenObjects[idxObject].creep.id;
        //     }
        // }
        //
        // return undefined;
    }

    _getObstacles(roomName) {
        if (this.obstacles.hasOwnProperty(roomName) === false) {
            this.obstacles[roomName] = [];

            let RoomManagerClass = require('RoomManager');
            let roomManager = new RoomManagerClass(roomName);
            this.debug('Getting structures from room manager');
            let roomStructures = roomManager.getStructures();

            for (let idxStructure = 0; idxStructure < roomStructures.length; idxStructure++) {
                this.debug('Examining ' + roomStructures[idxStructure] + ' to see if it is walkable');

                if (this.walkableStructureTypes.indexOf(roomStructures[idxStructure].structureType) === -1) {
                    this.debug(roomStructures[idxStructure] + ' is not walkable');
                    this.obstacles[roomName].push(roomStructures[idxStructure]);
                }
            }
        }

        return this.obstacles[roomName];
    }

    get isShowingDebugMessages() {
        return false;
    }

    isWalkable(position) {
        let obstacles = this._getObstacles(position.roomName);

        for (let idxObstacle = 0; idxObstacle < obstacles.length; idxObstacle++) {
            if (obstacles[idxObstacle].pos.isEqualTo(position)) {
                return false;
            }
        }

        return true;

        // let room = Game.rooms[position.roomName];
        //
        // if (room.getTerrain().get(position.x, position.y) === TERRAIN_MASK_WALL) {
        //     return false;
        // }
        //
        // this.warn('Call to look in isWalkable has high CPU cost');
        // let seenObjects = position.look();
        // // let unwalkableTypes = ['creep'];
        // // let walkableStructures = ['road'];
        //
        // for (let idxObject = 0; idxObject < seenObjects.length; idxObject++) {
        //     if (seenObjects[idxObject].type === 'structure') {
        //         if (walkableStructures.indexOf(seenObjects[idxObject].structure.structureType) === -1) {
        //             return false;
        //         }
        //     } else {
        //         if (unwalkableTypes.indexOf(seenObjects[idxObject].type) !== -1) {
        //             return false;
        //         }
        //     }
        // }
        //
        // return true;
    }

    getRange(startPosition, endPosition) {
        if (startPosition.roomName === endPosition.roomName) {
            return startPosition.getRangeTo(endPosition);
        } else {
            return 100;
        }
    }

    get memoryKey() {
        return this.name;
    }

    get name() {
        return 'UtilPosition';
    }

    sortIdsByRange(objectIds, position) {
        if (objectIds instanceof Array === false) {
            return undefined;
        }

        if (position instanceof RoomPosition === false) {
            return undefined;
        }

        let ranges = [];
        let gameObject;

        for (let idxObject = 0; idxObject < objectIds.length; idxObject++) {
            gameObject = Game.getObjectById(objectIds[idxObject]);

            if (gameObject === undefined) {
                continue;
            }

            ranges.push({ id: gameObject.id, range: this.getRange(position, gameObject.pos), sorted: false });
        }

        let sortedObjectIds = [];
        let allSorted = true;
        let objectInfo;
        let lowestRange;
        let lowestRangeObjectIndex;
        let idxRange;

        do {
            allSorted = true;
            lowestRange = 1000000;
            lowestRangeObjectIndex = undefined;

            for (idxRange = 0; idxRange < ranges.length; idxRange++) {
                if (ranges[idxRange].sorted) {
                    continue;
                }

                allSorted = false;

                if (ranges[idxRange].range < lowestRange) {
                    lowestRange = ranges[idxRange].range;
                    lowestRangeObjectIndex = idxRange;
                }
            }

            if (allSorted === false) {
                sortedObjectIds.push(ranges[lowestRangeObjectIndex].id);
                ranges[lowestRangeObjectIndex].sorted = true;
            }
        } while (allSorted === false);

        return sortedObjectIds;
    }

    get walkableStructureTypes() {
        return ['road'];
    }
}

module.exports = UtilPosition;