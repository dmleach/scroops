class UtilPosition
{
    static _getPositionsInRange(position, range) {
        let positions = [];

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

    static getClosestPositionInRange(startPosition, endPosition, range) {
        let positionsInRange = this._getPositionsInRange(endPosition, range);
        let closestPosition = undefined;
        let positionInRange;

        for (let idxPosition = 0; idxPosition < positionsInRange.length; idxPosition++) {
            positionInRange = positionsInRange[idxPosition];

            if (positionInRange.isEqualTo(startPosition)) {
                return startPosition;
            }

            if (this.isWalkable(positionInRange, [])) {
                if (closestPosition === undefined) {
                    closestPosition = positionInRange;
                } else if (this.getRange(startPosition, positionInRange) < this.getRange(startPosition, closestPosition)) {
                    closestPosition = positionInRange;
                }
            }
        }

        return closestPosition;
    }

    static getClosestInteractionPosition(position, id) {
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

    static getClosestInteractionPositionByCreepAndObject(creepId, gameObjectId) {
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

    static getCreepIdByPosition(position) {
        let seenObjects = position.look();

        for (let idxObject = 0; idxObject < seenObjects.length; idxObject++) {
            if (seenObjects[idxObject].type === 'creep') {
                return seenObjects[idxObject].creep.id;
            }
        }

        return undefined;
    }

    static isWalkable(position, unwalkableTypes = ['Creep'], walkableStructures = ['road']) {
        let room = Game.rooms[position.roomName];

        if (room.getTerrain().get(position.x, position.y) === TERRAIN_MASK_WALL) {
            return false;
        }

        let seenObjects = position.look();
        // let unwalkableTypes = ['creep'];
        // let walkableStructures = ['road'];

        for (let idxObject = 0; idxObject < seenObjects.length; idxObject++) {
            if (seenObjects[idxObject].type === 'structure') {
                if (walkableStructures.indexOf(seenObjects[idxObject].structure.structureType) === -1) {
                    return false;
                }
            } else {
                if (unwalkableTypes.indexOf(seenObjects[idxObject].type) !== -1) {
                    return false;
                }
            }
        }

        return true;
    }

    static getRange(startPosition, endPosition) {
        if (startPosition.roomName === endPosition.roomName) {
            return startPosition.getRangeTo(endPosition);
        } else {
            return 100;
        }
    }
}

module.exports = UtilPosition;