let GameObjectClass = require('GameObject');

class CreepAncestor extends GameObjectClass
{
    constructor(id) {
        super(id);

        this.MODE_TAKE_ENERGY = 'takeEnergy';
        this.MODE_GIVE_ENERGY = 'giveEnergy';
    }

    static get basicBody() {
        return [];
    }

    static get bodyIncrement() {
        return undefined;
    }

    static canSpawn(roomName, worldManager, utilCreep) {
        return false;
    }

    get canTakeEnergyWhenRoomNotFull() {
        return false;
    }

    get energy() {
        if (this.gameObject.store === undefined) {
            return 0;
        }

        return this.gameObject.store[RESOURCE_ENERGY];
    }

    static getBodyByEnergy(energy) {
        if (this.bodyIncrement === undefined) {
            return this.basicBody;
        }

        let UtilSpawnClass = require('UtilSpawn');
        let basicBodyCost = UtilSpawnClass.getCostByBody(this.basicBody);
        let remainingEnergy = energy - basicBodyCost;
        let bodyIncrementCost = UtilSpawnClass.getCostByBody(this.bodyIncrement);
        let incrementCount = Math.trunc(remainingEnergy / bodyIncrementCost);

        let body = this.basicBody;

        for (let idxIncrement = 0; idxIncrement < incrementCount; idxIncrement++) {
            this.bodyIncrement.forEach(function(bodyPart) {
                body.push(bodyPart);
            });
        }

        return body;
    }

    getClosestInteractionPositionById(objectId, worldManager) {
        if (objectId === undefined || objectId === null) {
            this.error(ERR_INVALID_ARGS, 'Object id given to getClosestInteractionPositionById is undefined');
            return undefined;
        }

        let GameObjectClass = require('GameObject');
        let interactionObject = new GameObjectClass(objectId);
        this.debug('Getting closest interaction position for ' + interactionObject.name);

        let UtilPositionClass = require('UtilPosition');
        let utilPosition = new UtilPositionClass();
        return utilPosition.getClosestPositionInRange(this.pos, interactionObject.pos, this.getInteractionRange(objectId), worldManager);
    }

    getGiveEnergyTargetId(worldManager) {
        return undefined;
    }

    getInteractionRange(objectId) {
        return 1;
    }

    getTakeEnergyTargetId(worldManager) {
        return undefined;
    }

    giveEnergy() {
        let GameObjectClass = require('GameObject');
        let giveEnergyTarget = new GameObjectClass(this.giveEnergyTargetId);

        this.debug('Attempting to give energy to ' + giveEnergyTarget.name);

        let giveResult;

        if (giveEnergyTarget.gameObject instanceof ConstructionSite) {
            giveResult = this.giveEnergyToConstructionSite(giveEnergyTarget.gameObject);
        } else if (giveEnergyTarget.gameObject instanceof StructureController) {
            giveResult = this.giveEnergyToController(giveEnergyTarget.gameObject);
        } else if (giveEnergyTarget.gameObject instanceof StructureContainer) {
            giveResult = this.giveEnergyToContainer(giveEnergyTarget.gameObject);
        } else if (giveEnergyTarget.gameObject instanceof Structure) {
            giveResult = this.giveEnergyToStructure(giveEnergyTarget.gameObject);
        } else if (giveEnergyTarget.gameObject instanceof Creep) {
            giveResult = this.giveEnergyToCreep(giveEnergyTarget.gameObject);
        } else {
            giveResult = this.gameObject.transfer(giveEnergyTarget.gameObject, RESOURCE_ENERGY);
        }

        if (giveResult !== OK) {
            this.error(giveResult, 'Could not give energy to ' + giveEnergyTarget.name);
        }

        return giveResult;
    }

    giveEnergyToConstructionSite(site) {
        return this.gameObject.build(site);
    }

    giveEnergyToContainer(container) {
        return this.gameObject.transfer(container, RESOURCE_ENERGY);
    }

    giveEnergyToController(controller) {
        return this.gameObject.upgradeController(controller);
    }

    giveEnergyToCreep(creep) {
        return this.gameObject.attack(creep);
    }

    giveEnergyToStructure(structure) {
        return this.gameObject.transfer(structure, RESOURCE_ENERGY);
    }

    giveEnergyWithUndefinedTarget(worldManager) {
        // let UtilError = require('UtilError');
        //
        // if (this.getGiveEnergyTargetId === undefined) {
        //     this.error(UtilError.ERR_NO_GIVE_TARGET);
        // }
        //
        // if (this.giveEnergyPos === undefined) {
        //     this.error(UtilError.ERR_NO_GIVE_POSITION);
        // }
    }

    get mode() {
        return undefined;
    }

    move(direction, worldManager) {
        if (this.tired) {
            this.debug('Too tired to move');
            return false;
        }

        let alternatives = [direction];

        if (direction === TOP) {
            alternatives.push(TOP_LEFT, TOP_RIGHT);
        } else if (direction === TOP_RIGHT) {
            alternatives.push(TOP, RIGHT);
        } else if (direction === RIGHT) {
            alternatives.push(TOP_RIGHT, BOTTOM_RIGHT);
        } else if (direction === BOTTOM_RIGHT) {
            alternatives.push(RIGHT, BOTTOM);
        } else if (direction === BOTTOM) {
            alternatives.push(BOTTOM_RIGHT, BOTTOM_LEFT);
        } else if (direction === BOTTOM_LEFT) {
            alternatives.push(BOTTOM, LEFT);
        } else if (direction === LEFT) {
            alternatives.push(BOTTOM_LEFT, TOP_LEFT);
        } else if (direction === TOP_LEFT) {
            alternatives.push(LEFT, TOP);
        }

        if (Math.random() < 0.5) {
            let lastAlternative = alternatives[2];
            alternatives[2] = alternatives[1];
            alternatives[1] = lastAlternative;
            // alternatives = [alternatives[0], alternatives[2], alternatives[1]];
        }

        let destination;
        let UtilPositionClass = require('UtilPosition');
        let utilPosition = new UtilPositionClass();
        let creepInTheWay;
        let creepInTheWayId;
        let creepInTheWayClass;
        let creepsInTheWayIds = [];
        let Role = require('Role');
        let UtilErrorClass = require('UtilError');
        let idxAlternative;
        let alternative;

        // while (alternatives.length > 0) {
        for (idxAlternative = 0; idxAlternative < alternatives.length; idxAlternative++) {
            // Creeps can get stuck by always trying to use the same alternative, so mix things up
            // idxAlternative = Math.floor(Math.random() * alternatives.length);
            alternative = alternatives[idxAlternative];
            // alternatives.splice(idxAlternative, 1);
            
            this.debug('Attempting to move ' + this.directionName(alternative));

            if (alternative === TOP && this.pos.y > 0) {
                destination = new RoomPosition(this.pos.x, this.pos.y - 1, this.pos.roomName);
            } else if (alternative === TOP_RIGHT && this.pos.x < 49 && this.pos.y > 0) {
                destination = new RoomPosition(this.pos.x + 1, this.pos.y - 1, this.pos.roomName);
            } else if (alternative === RIGHT && this.pos.x < 49) {
                destination = new RoomPosition(this.pos.x + 1, this.pos.y, this.pos.roomName);
            } else if (alternative === BOTTOM_RIGHT && this.pos.x < 49 && this.pos.y < 49) {
                destination = new RoomPosition(this.pos.x + 1, this.pos.y + 1, this.pos.roomName)
            } else if (alternative === BOTTOM && this.pos.y < 49) {
                destination = new RoomPosition(this.pos.x, this.pos.y + 1, this.pos.roomName);
            } else if (alternative === BOTTOM_LEFT && this.pos.x > 0 && this.pos.y < 49) {
                destination = new RoomPosition(this.pos.x - 1, this.pos.y + 1, this.pos.roomName);
            } else if (alternative === LEFT && this.pos.x > 0) {
                destination = new RoomPosition(this.pos.x - 1, this.pos.y, this.pos.roomName);
            } else if (alternative === TOP_LEFT && this.pos.x > 0 && this.pos.y > 0) {
                destination = new RoomPosition(this.pos.x - 1, this.pos.y - 1, this.pos.roomName);
            } else {
                continue;
            }

            creepInTheWayId = utilPosition.getCreepIdByPosition(destination);

            if (creepInTheWayId !== undefined) {
                let GameObjectClass = require('GameObject');
                creepInTheWay = new GameObjectClass(creepInTheWayId);
                this.debug(creepInTheWay.name + ' is in the way');
                creepsInTheWayIds.push(creepInTheWayId);
                continue;
            }

            if (worldManager.isWalkable(destination) === false) {
                this.debug(destination + ' is not currently walkable');
                continue;
            }

            let moveResult = this.gameObject.move(alternative);

            if (moveResult === OK) {
                this.debug('Move result is ' + moveResult + ', position is now ' + this.pos);
            } else {
                this.error(moveResult, 'Moving ' + this.directionName(direction) + ' to ' + destination);
            }

            return moveResult;
        }

        this.debug('Creeps in the way: ' + creepsInTheWayIds);

        for (let idxCreepInTheWay = 0; idxCreepInTheWay < creepsInTheWayIds.length; idxCreepInTheWay++) {
            creepInTheWayClass = Role.getCreepClassByCreepId(creepsInTheWayIds[idxCreepInTheWay]);
            creepInTheWay = new creepInTheWayClass(creepsInTheWayIds[idxCreepInTheWay]);
            this.debug('Moving ' + creepInTheWay.name + ' out of the way');

            if (this.movePriority > creepInTheWay.movePriority) {
                creepInTheWay.moveAway(worldManager);
            }
        }

        return ERR_NO_PATH;
    }

    moveAway(worldManager) {
        let moveOptions = [TOP, RIGHT, BOTTOM, LEFT];

        for (let moveOption of moveOptions) {
            if (this.move(moveOption, worldManager) === OK) {
                return;
            }
        }
    }

    _moveOffExit() {
        if (this.pos.x === 0) {
            this.gameObject.move(RIGHT);
            return;
        }

        if (this.pos.x === 49) {
            this.gameObject.move(LEFT);
            return;
        }

        if (this.pos.y === 0) {
            this.gameObject.move(BOTTOM);
            return;
        }

        if (this.pos.y === 49) {
            this.gameObject.move(TOP);
        }
    }

    get movePriority() {
        return 0;
    }

    static numberToSpawn(worldManager, utilCreep) {
        return 1;
    }

    get role() {
        let Role = require('Role');
        return Role.getRoleByCreepId(this.id);
    }

    get spawning() {
        return this.gameObject.spawning;
    }

    takeEnergy() {
        let GameObjectClass = require('GameObject');
        let takeEnergyTarget = new GameObjectClass(this.takeEnergyTargetId);

        this.debug('Attempting to take energy from ' + takeEnergyTarget.name);

        let takeResult;

        if (takeEnergyTarget.gameObject instanceof Source) {
            takeResult = this.takeEnergyFromSource(takeEnergyTarget.gameObject);
        } else if (takeEnergyTarget.gameObject instanceof Resource) {
            takeResult = this.takeEnergyFromResource(takeEnergyTarget.gameObject);
        } else {
            takeResult = this.gameObject.withdraw(takeEnergyTarget.gameObject, RESOURCE_ENERGY);
        }

        if (takeResult !== OK) {
            this.error(takeResult, 'Could not take energy from ' + takeEnergyTarget.name);
        }

        return takeResult;
    }

    takeEnergyFromResource(resource) {
        return this.gameObject.pickup(resource);
    }

    takeEnergyFromSource(source) {
        return this.gameObject.harvest(source);
    }

    takeEnergyWithUndefinedTarget() {
        // let UtilError = require('UtilError');
        //
        // if (this.takeEnergyTargetId === undefined) {
        //     this.error(UtilError.ERR_NO_TAKE_TARGET);
        // }
        //
        // if (this.takeEnergyPos === undefined) {
        //     this.error(UtilError.ERR_NO_TAKE_POSITION);
        // }
    }

    get tired() {
        if (this.gameObject === undefined || this.gameObject === null) {
            return undefined;
        }

        return this.gameObject.fatigue > 0;
    }

    work(worldManager, utilPath) {
        this.debug('Beginning work');

        if (this.spawning) {
            this.debug('Currently spawning, so doing no work');
            return false;
        }

        this._moveOffExit();
        let path;

        if (this.mode === this.MODE_TAKE_ENERGY && (this.takeEnergyTargetId === undefined || this.takeEnergyPos === undefined) ) {
            this.debug('In take mode, but either the target id or position is undefined');
            return this.takeEnergyWithUndefinedTarget(worldManager);
        }

        if (this.mode === this.MODE_GIVE_ENERGY && (this.giveEnergyTargetId === undefined || this.giveEnergyPos === undefined) ) {
            return this.giveEnergyWithUndefinedTarget(worldManager);
        }

        if (this.mode === this.MODE_TAKE_ENERGY && this.pos.isEqualTo(this.takeEnergyPos) === false) {
            path = utilPath.getPath(this.pos, this.takeEnergyPos);

            if (path !== undefined && path.length > 0) {
                return this.move(path[0].direction, worldManager);
            } else {
                return ERR_NO_PATH;
            }
        }

        if (this.mode === this.MODE_TAKE_ENERGY && this.pos.isEqualTo(this.takeEnergyPos) === true) {
            return this.takeEnergy();
        }

        if (this.mode === this.MODE_GIVE_ENERGY && this.pos.isEqualTo(this.giveEnergyPos) === false) {
            path = utilPath.getPath(this.pos, this.giveEnergyPos);

            if (path !== undefined && path.length > 0) {
                return this.move(path[0].direction, worldManager);
            } else {
                return ERR_NO_PATH;
            }
        }

        if (this.mode === this.MODE_GIVE_ENERGY && this.pos.isEqualTo(this.giveEnergyPos) === true) {
            this.debug('At give energy position, attempting to give energy');
            return this.giveEnergy();
        }

        return undefined;
    }
}

module.exports = CreepAncestor;