let GameObjectClass = require('GameObject');

class CreepAncestor extends GameObjectClass
{
    constructor(id) {
        super(id);

        this.MODE_TAKE_ENERGY = 'takeEnergy';
        this.MODE_GIVE_ENERGY = 'giveEnergy';

        this.KEY_TAKE_ENERGY_TARGET_ID = 'takeEnergyTargetId';
        this.KEY_TAKE_ENERGY_POS = 'takeEnergyPos';
        this.KEY_GIVE_ENERGY_TARGET_ID = 'giveEnergyTargetId';
        this.KEY_GIVE_ENERGY_POS = 'giveEnergyPos';
        this.KEY_PATH_STRING = 'pathString';
        this.KEY_PATH_STEP = 'pathStep';
    }

    get attackPower() {
        let attackPower = 0;

        for (let idxBody = 0; idxBody < this.gameObject.body.length; idxBody++) {
            if (this.gameObject.body[idxBody].type === ATTACK) {
                attackPower += 30;
            }
        }

        return attackPower;
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

    clearGiveEnergyCache() {
        this.debug('Clearing give energy cache');
        this.writeToCache(this.KEY_GIVE_ENERGY_TARGET_ID, undefined);
        this.writeToCache(this.KEY_GIVE_ENERGY_POS, undefined);

        if (this.mode === this.MODE_GIVE_ENERGY) {
            this.clearPathCache();
        }
    }

    clearPathCache() {
        this.debug('Clearing path cache');
        this.writeToCache(this.KEY_PATH_STRING, undefined);
        this.writeToCache(this.KEY_PATH_STEP, undefined);
    }

    clearTakeEnergyCache() {
        this.debug('Clearing take energy cache');
        this.writeToCache(this.KEY_TAKE_ENERGY_TARGET_ID, undefined);
        this.writeToCache(this.KEY_TAKE_ENERGY_POS, undefined);

        if (this.mode === this.MODE_TAKE_ENERGY) {
            this.clearPathCache();
        }
    }

    debugCache() {
        this.debugCachedTakeEnergyTargetId();
        this.debugCachedTakePos();
        this.debugCachedGiveEnergyTargetId();
        this.debugCachedGivePos();
        this.debugCachedPath();
    }

    debugCachedGivePos() {
        this.debug('Cached give energy position is ' + this.readFromCache(this.KEY_GIVE_ENERGY_POS));
    }

    debugCachedGiveEnergyTargetId() {
        this.debug('Cached give energy target id is ' + this.readFromCache(this.KEY_GIVE_ENERGY_TARGET_ID));
    }

    debugCachedPath() {
        let cachedPath = this.readFromCache(this.KEY_PATH_STRING);

        if (cachedPath === undefined) {
            this.debug('Cached path is undefined: ' + cachedPath);
        } else if (cachedPath === '') {
            this.debug('Cached path is an empty string');
        } else {
            this.debug('Cached path is "' + cachedPath + '"');
        }
    }

    debugCachedTakePos() {
        this.debug('Cached take energy position is ' + this.readFromCache(this.KEY_TAKE_ENERGY_POS));
    }

    debugCachedTakeEnergyTargetId() {
        this.debug('Cached take energy target id is ' + this.readFromCache(this.KEY_TAKE_ENERGY_TARGET_ID));
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
        let closestPosition = utilPosition.getClosestPositionInRange(this.pos, interactionObject.pos, this.getInteractionRange(objectId), worldManager);
        this.debug('Closest interation position is ' + closestPosition);
        return closestPosition;
    }

    getGiveEnergyPos(worldManager) {
        let cachedValue = this.readFromCache(this.KEY_GIVE_ENERGY_POS);

        if (cachedValue !== undefined) {
            let cachedPos = new RoomPosition(cachedValue.x, cachedValue.y, cachedValue.roomName);

            if (this.isValidGiveEnergyPos(cachedPos, worldManager)) {
                this.debug('Returning give energy position ' + cachedPos + ' from cache');
                return cachedPos;
            } else {
                this.debug('Cached give energy position ' + cachedPos + ' is invalid');
            }
        } else {
            this.debug('No cached give energy position found');
        }

        if (this.isValidGiveEnergyPos(this.pos, worldManager)) {
            this.debug('Creep is already at a valid take energy position; returning current position');
            return this.pos;
        }

        let gameObject = Game.getObjectById(this.giveEnergyTargetId);

        if (gameObject === undefined) {
            return undefined;
        }

        if (this.isValidGiveEnergyPos(this.gameObject.pos, worldManager) === false) {
            this.debug('Give energy target id ' + this.giveEnergyTargetId + ' is invalid, so give energy position is undefined');
            return undefined;
        }

        let giveEnergyPos = this.getClosestInteractionPositionById(this.giveEnergyTargetId, worldManager);
        this.debug('Calculated give energy position is ' + giveEnergyPos);
        return giveEnergyPos;
    }

    getGiveEnergyTargetId(worldManager, utilCreep) {
        let cachedId = this.readFromCache(this.KEY_GIVE_ENERGY_TARGET_ID);

        if (this.isValidGiveEnergyTargetId(cachedId)) {
            return cachedId;
        }

        return undefined;
    }

    getInteractionRange(objectId) {
        return 1;
    }

    getPath(utilPath, worldManager) {
        let cachedPathString = this.readFromCache(this.KEY_PATH_STRING);
        let cachedPathStep = parseInt(this.readFromCache(this.KEY_PATH_STEP));

        if (cachedPathString !== undefined && cachedPathStep !== undefined && cachedPathStep < cachedPathString.length) {
            this.debug('Read cached path ' + cachedPathString + ' and step ' + cachedPathStep + ' from cache');
            let cachedPathSegment = cachedPathString.slice(cachedPathStep);
            this.writeToCache(this.KEY_PATH_STEP, cachedPathStep + 1);
            return utilPath.getPathFromPathString(cachedPathSegment);
        }

        let destination = this.mode === this.MODE_TAKE_ENERGY ? this.takeEnergyPos : this.giveEnergyPos;
        this.debug('Destination is ' + destination);
        let path = utilPath.getPath(this.pos, destination, worldManager);
        let pathString = utilPath.getPathStringFromPath(path);
        this.debug('Calculated path string is ' + pathString);

        if (pathString !== undefined && pathString.length > 0) {
            this.writeToCache(this.KEY_PATH_STRING, pathString);
            this.writeToCache(this.KEY_PATH_STEP, 0);
            return path;
        } else {
            return ERR_NO_PATH;
        }
    }

    getPathUpdateFunctionVersion(utilPath, worldManager) {
        let cachedValue = this.readFromCache(this.KEY_PATH_STRING);

        if (cachedValue !== undefined) {
            let cachedPath = utilPath.getPathFromPathString(cachedValue);

            if (this.isValidPath(cachedPath)) {
                this.debug('Returning path ' + cachedValue + ' from cache');
                return cachedPath;
            } else {
                this.debug('Cached path ' + cachedValue + ' is invalid');
            }
        } else {
            this.debug('No cached path found');
        }

        let destination;
        let mode = this.mode;

        if (mode === this.MODE_TAKE_ENERGY) {
            destination = this.takeEnergyPos;
        } else if (mode === this.MODE_GIVE_ENERGY) {
            destination = this.giveEnergyPos;
        } else {
            this.debug('Mode ' + mode + ' is invalid, so path is undefined');
            return undefined;
        }

        this.debug('Destination is ' + destination);

        if (destination === undefined) {
            return undefined;
        }

        if (this.pos.isEqualTo(destination)) {
            this.debug('Already at the destination, returning empty array');
            return [];
        }

        let path = utilPath.getPathUpdateFunctionVersion(this.pos, destination, worldManager);
        let pathString = utilPath.getPathStringFromPath(path);
        this.debug('Calculated path string is "' + pathString + '"');

        if (typeof pathString === 'string') {
            this.writeToCache(this.KEY_PATH_STRING, pathString);
            this.debug('Returning calculated path ' + pathString);
            return path;
        } else {
            this.debug('Could not find a path from ' + this.pos + ' to ' + destination);
            return ERR_NO_PATH;
        }
    }

    getTakeEnergyPos(worldManager) {
        let cachedValue = this.readFromCache(this.KEY_TAKE_ENERGY_POS);

        if (cachedValue !== undefined) {
            let cachedPos = new RoomPosition(cachedValue.x, cachedValue.y, cachedValue.roomName);

            if (this.isValidTakeEnergyPos(cachedPos, worldManager)) {
                this.debug('Returning take energy position ' + cachedPos + ' from cache');
                return cachedPos;
            } else {
                this.debug('Cached take energy position ' + cachedPos + ' is invalid');
            }
        } else {
            this.debug('No cached take energy position found');
        }

        if (this.isValidTakeEnergyPos(this.pos, worldManager)) {
            this.debug('Creep is already at a valid take energy position; returning current position');
            return this.pos;
        }

        let gameObject = Game.getObjectById(this.takeEnergyTargetId);

        if (gameObject === undefined) {
            return undefined;
        }

        if (this.isValidTakeEnergyPos(gameObject.pos, worldManager) === false) {
            this.debug('Take energy target id ' + this.takeEnergyTargetId + ' is invalid, so take energy position is undefined');
            return undefined;
        }

        let takeEnergyPos = this.getClosestInteractionPositionById(this.takeEnergyTargetId, worldManager);
        this.debug('Calculated take energy position is ' + takeEnergyPos);
        return takeEnergyPos;
    }

    getTakeEnergyTargetId(worldManager) {
        let cachedId = this.readFromCache(this.KEY_TAKE_ENERGY_TARGET_ID);

        if (this.isValidTakeEnergyTargetId(cachedId)) {
            return cachedId;
        }

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

        if (giveResult === OK) {
            if (this.shouldClearCacheAfterGiveEnergy) {
                this.setGiveEnergyTargetId(undefined);
            }
        } else {
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

    get isUsingUpdateGiveEnergyFunction() {
        return false;
    }

    get isUsingUpdateTakeEnergyFunction() {
        return false;
    }

    isValidGiveEnergyPos(position, worldManager) {
        if (position === undefined) {
            this.debug('Position is undefined, so it is not a valid give energy position; returning false');
            return false;
        }

        if (this.giveEnergyTargetId === undefined) {
            this.debug('Give energy target id is undefined, so no position is valid; returning false');
            return false;
        }

        let gameObject = Game.getObjectById(this.giveEnergyTargetId);

        if (gameObject === undefined) {
            this.debug('Id ' + this.giveEnergyTargetId + ' does not return a game object, so no position is valid; returning false');
            return false;
        }

        let interactionRange = this.getInteractionRange(this.giveEnergyTargetId);

        if (gameObject.pos.getRangeTo(position) > interactionRange) {
            this.debug('Position of game object ' + gameObject.pos + ' and given position ' + position + ' are more than ' + interactionRange + ' spaces apart; returning false');
            return false;
        }

        let rangeToGivePosition = this.pos.getRangeTo(position);
        let rangeToTarget = this.pos.getRangeTo(gameObject.pos);

        if (rangeToTarget === 1 && rangeToGivePosition > 0) {
            this.debug('Position ' + position + ' is wrong because creep is already one space away; returning false');
            return false;
        }

        if (rangeToGivePosition !== 1) {
            this.debug('Position ' + position + ' passes all tests and is ' + rangeToGivePosition + ' spaces away; returning true');
            return true;
        }

        let isWalkable = worldManager.isWalkable(position);
        this.debug('Position ' + position + ' is one space away; returning whether it is walkable: ' + isWalkable);
        return isWalkable;
    }

    isValidGiveEnergyTargetId(id) {
        this.debug('Descendant class does not define isValidGiveEnergyTargetId; returning false');
        return false;
    }

    isValidPath(path) {
        if ( (path instanceof Array) === false) {
            this.debug('Path is not valid because it is not an array; value is: ' + path);
            return false;
        }

        for (let idxPath = 0; idxPath < path.length; idxPath++) {
            if (path[idxPath].direction === undefined) {
                this.debug('Path is not valid because step ' + idxPath + ' does not have a direction property');
                return false;
            }
        }

        let intendedDestination;

        if (this.mode === this.MODE_TAKE_ENERGY) {
            intendedDestination = this.takeEnergyPos;
        } else if (this.mode === this.MODE_GIVE_ENERGY) {
            intendedDestination = this.giveEnergyPos;
        } else {
            return false;
        }

        if (intendedDestination === undefined) {
            return false;
        }

        let pathDestination = this.getPathDestination(this.pos, path);
        this.debug('Returning whether path destination ' + pathDestination + ' equals the intended destination ' + intendedDestination);
        return intendedDestination.isEqualTo(pathDestination);
    }

    isValidTakeEnergyPos(position, worldManager) {
        if (position === undefined) {
            this.debug('Position is undefined, so it is not a valid take energy position; returning false');
            return false;
        }

        if (this.takeEnergyTargetId === undefined) {
            this.debug('Take energy target id is undefined, so no position is valid; returning false');
            return false;
        }

        let gameObject = Game.getObjectById(this.takeEnergyTargetId);

        if (gameObject === undefined) {
            this.debug('Id ' + this.takeEnergyTargetId + ' does not return a game object, so no position is valid; returning false');
            return false;
        }

        let interactionRange = this.getInteractionRange(this.takeEnergyTargetId);

        if (gameObject.pos.getRangeTo(position) > interactionRange) {
            this.debug('Position of game object ' + gameObject.pos + ' and given position ' + position + ' are more than ' + interactionRange + ' spaces apart; returning false');
            return false;
        }

        let currentRange = this.pos.getRangeTo(position);

        if (currentRange !== 1) {
            this.debug('Position ' + position + ' passes all tests and is ' + currentRange + ' spaces away; returning true');
            return true;
        }

        let isWalkable = worldManager.isWalkable(position);
        this.debug('Position ' + position + ' is one space away; returning whether it is walkable: ' + isWalkable);
        return isWalkable;
    }

    isValidTakeEnergyTargetId(id) {
        this.debug('Descendant class does not define isValidTakeEnergyTargetId; returning false');
        return false;
    }

    get mode() {
        this.debug('Descendant class does not define mode; returning undefined');
        return undefined;
    }

    move(direction, worldManager) {
        if (this.tired) {
            this.debug('Too tired to move');
            return false;
        }

        let alternatives = this.getDirectionsOutFrom(direction).slice(0, 4);
        // let alternatives = [direction];
        //
        // if (direction === TOP) {
        //     alternatives.push(TOP_LEFT, TOP_RIGHT, LEFT, RIGHT);
        // } else if (direction === TOP_RIGHT) {
        //     alternatives.push(TOP, RIGHT, TOP_LEFT, BOTTOM_RIGHT);
        // } else if (direction === RIGHT) {
        //     alternatives.push(TOP_RIGHT, BOTTOM_RIGHT, TOP, BOTTOM);
        // } else if (direction === BOTTOM_RIGHT) {
        //     alternatives.push(RIGHT, BOTTOM, TOP_RIGHT, BOTTOM_LEFT);
        // } else if (direction === BOTTOM) {
        //     alternatives.push(BOTTOM_RIGHT, BOTTOM_LEFT, RIGHT, LEFT);
        // } else if (direction === BOTTOM_LEFT) {
        //     alternatives.push(BOTTOM, LEFT, BOTTOM_RIGHT, TOP_LEFT);
        // } else if (direction === LEFT) {
        //     alternatives.push(BOTTOM_LEFT, TOP_LEFT, BOTTOM, TOP);
        // } else if (direction === TOP_LEFT) {
        //     alternatives.push(LEFT, TOP, TOP_RIGHT, BOTTOM_LEFT);
        // }

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

            this.debug('Attempting to move ' + this.directionName(alternative) + ' to ' + destination);
            creepInTheWayId = utilPosition.getCreepIdByPosition(destination);

            if (creepInTheWayId !== undefined) {
                creepInTheWayClass = Role.getCreepClassByCreepId(creepInTheWayId);
                creepInTheWay = new creepInTheWayClass(creepInTheWayId);

                if (creepInTheWay.movePriority < this.movePriority) {
                    this.debug('Moving ' + creepInTheWay.name + ' out of the way');
                    creepInTheWay.moveAway(worldManager, alternative);
                }
            } else if (worldManager.isWalkable(destination) === false) {
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

        return ERR_NO_PATH;
    }

    moveAway(worldManager, blockingDirection) {
        let moveOptions = this.getDirectionsOutFrom(blockingDirection);

        this.debug('Moving out of the way of a creep wanting to move ' + blockingDirection + ': ' + moveOptions);

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

    readFromCache(key) {
        let creepMemory = Memory.creeps[this.name];
        let memoryValue = creepMemory[key];
        return memoryValue;
    }

    get role() {
        let Role = require('Role');
        return Role.getRoleByCreepId(this.id);
    }

    setGiveEnergyPosSimple(position) {
        this.debug('Setting and caching give energy position ' + position);
        this.giveEnergyPos = position;
        this.writeToCache(this.KEY_GIVE_ENERGY_POS, position);
    }

    setGiveEnergyTargetId(id) {
        this.debug('Setting give energy target id to ' + id);
        this.giveEnergyTargetId = id;
        this.writeToCache(this.KEY_GIVE_ENERGY_TARGET_ID, id);

        if (id === undefined || this.isShowingDebugMessages === false) {
            return;
        }

        let GameObjectClass = require('GameObject');
        let gameObject = new GameObjectClass(id);
        this.debug('Giving energy to ' + gameObject.name);
    }

    setPath(path, utilPath, startingStep = 0) {
        this.debug('Setting path ' + path);

        let pathString = utilPath.getPathStringFromPath(path);

        if (pathString === undefined) {
            this.error('Could not get a path string for the given path');
            this.clearPathCache();
            return;
        }

        let cachedPathString = path.slice(startingStep);
        this.debug('Caching path ' + cachedPathString + ' after removing all before step ' + startingStep);
        this.writeToCache(this.KEY_PATH_STRING, cachedPathString);
    }

    setTakeEnergyPosSimple(position) {
        this.debug('Setting and caching take energy position ' + position);
        this.takeEnergyPos = position;
        this.writeToCache(this.KEY_TAKE_ENERGY_POS, position);
    }

    setTakeEnergyTargetId(id, worldManager) {
        this.debug('Setting and caching take energy target ' + id);
        this.takeEnergyTargetId = id;
        this.writeToCache(this.KEY_TAKE_ENERGY_TARGET_ID, id);

        if (id === undefined) {
            this.writeToCache(this.KEY_TAKE_ENERGY_POS, undefined);
            return;
        }

        let takeEnergyPos = this.getTakeEnergyPos(worldManager);
        this.takeEnergyPos = takeEnergyPos;
        this.writeToCache(this.KEY_TAKE_ENERGY_POS, takeEnergyPos);

        if (this.isShowingDebugMessages === false) {
            return;
        }

        let GameObjectClass = require('GameObject');
        let gameObject = new GameObjectClass(id);
        this.debug('Moving to ' + takeEnergyPos + ' to take energy from ' + gameObject.name);
    }

    setGiveEnergyTargetIdSimple(id) {
        if (this.isShowingDebugMessages) {
            let GameObjectClass = require('GameObject');
            let gameObject = new GameObjectClass(id);
            this.debug('Setting and caching give energy target ' + gameObject.name);
        }

        this.giveEnergyTargetId = id;
        this.writeToCache(this.KEY_GIVE_ENERGY_TARGET_ID, id);
    }

    setTakeEnergyTargetIdSimple(id) {
        if (this.isShowingDebugMessages) {
            let GameObjectClass = require('GameObject');
            let gameObject = new GameObjectClass(id);
            this.debug('Setting and caching take energy target ' + gameObject.name);
        }

        this.takeEnergyTargetId = id;
        this.writeToCache(this.KEY_TAKE_ENERGY_TARGET_ID, id);
    }

    get shouldClearCacheAfterGiveEnergy() {
        return true;
    }

    get shouldClearCacheAfterTakeEnergy() {
        return true;
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

        if (this.shouldClearCacheAfterTakeEnergy) {
            this.setTakeEnergyTargetId(undefined);
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

    get ticksToLive() {
        return this.gameObject.ticksToLive;
    }

    get tired() {
        if (this.gameObject === undefined || this.gameObject === null) {
            return undefined;
        }

        return this.gameObject.fatigue > 0;
    }

    updateGiveEnergyTarget(worldManager, utilPath, utilCreep) {
        if (this.isUsingUpdateGiveEnergyFunction === false) {
            this.debug('Not using updateGiveEnergyTarget');
            return undefined;
        }

        this.debug('Using updateGiveEnergyTarget');

        // First get the creep's target id, which may be read from cache
        let targetId = this.getGiveEnergyTargetId(worldManager, utilCreep);

        // If the give energy target is undefined, clear the cache and bail out
        if (targetId === undefined) {
            this.debug('Give energy target id is undefined; clearing give cache and bailing out');
            this.clearGiveEnergyCache();
            return undefined;
        }

        // Set the creep's give target id, writing it to cache
        this.setGiveEnergyTargetIdSimple(targetId);

        // Next get the position from which the creep will interact with the target, which may also be read from cache
        let destinationPos = this.getGiveEnergyPos(worldManager);

        // If the position is invalid, clear the cache and bail out
        if (this.isValidGiveEnergyPos(destinationPos, worldManager) === false) {
            this.debug('Give energy pos ' + destinationPos + ' is invalid; clearing give cache and bailing out');
            this.clearGiveEnergyCache();
            return targetId;
        }

        // Set the creep's give position, writing it to cache
        this.setGiveEnergyPosSimple(destinationPos);

        // Lastly, if the creep is in take mode, get the path to the destination, which may be read from cache
        if (this.mode !== this.MODE_TAKE_ENERGY) {
            return targetId;
        }

        if (this.pos.isEqualTo(this.giveEnergyPos)) {
            this.debug('Already at the give energy position, so no need to process path; returning target id ' + targetId);
            return targetId;
        }

        let path = this.getPathUpdateFunctionVersion(utilPath, worldManager);

        // If the path is invalid, clear the cache and bail out
        if (this.isValidPath(path, worldManager) === false) {
            this.clearTakeEnergyCache();
            return targetId;
        }

        // Set the creep's path, writing it to the cache minus its first step
        this.setPath(path, utilPath, 1);

        return targetId;
    }

    updateTakeEnergyTarget(worldManager, utilPath) {
        if (this.isUsingUpdateTakeEnergyFunction === false) {
            this.debug('Not using updateTakeEnergyTarget');
            return undefined;
        }

        this.debug('Using updateTakeEnergyTarget');

        // First get the creep's target id, which may be read from cache
        let targetId = this.getTakeEnergyTargetId(worldManager);

        // If the take energy target is undefined, clear the cache and bail out
        if (targetId === undefined) {
            this.debug('Take energy target id is undefined; clearing take cache and bailing out');
            this.clearTakeEnergyCache();
            return undefined;
        }

        // Set the creep's take target id, writing it to cache
        this.setTakeEnergyTargetIdSimple(targetId);

        // Next get the position from which the creep will interact with the target, which may also be read from cache
        let destinationPos = this.getTakeEnergyPos(worldManager);

        // If the position is invalid, clear the cache and bail out
        if (this.isValidTakeEnergyPos(destinationPos, worldManager) === false) {
            this.debug('Take energy pos ' + destinationPos + ' is invalid; clearing take cache and bailing out');
            this.clearTakeEnergyCache();
            return targetId;
        }

        // Set the creep's take position, writing it to cache
        this.setTakeEnergyPosSimple(destinationPos);

        // Lastly, if the creep is in take mode, get the path to the destination, which may be read from cache
        if (this.mode !== this.MODE_TAKE_ENERGY) {
            this.debug('Not in take energy mode, so not processing path and just returning target id ' + targetId);
            return targetId;
        }

        if (this.pos.isEqualTo(this.takeEnergyPos)) {
            this.debug('Already at the take energy position, so no need to process path; returning target id ' + targetId);
            return targetId;
        }

        let path = this.getPathUpdateFunctionVersion(utilPath, worldManager);

        // If the path is invalid, clear the cache and bail out
        if (this.isValidPath(path, worldManager) === false) {
            this.clearGiveEnergyCache();
            return targetId;
        }

        // Set the creep's path, writing it to the cache minus its first step
        this.setPath(path, utilPath, 1);

        return targetId;
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
            path = this.getPath(utilPath, worldManager);

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
            // path = utilPath.getPath(this.pos, this.giveEnergyPos, worldManager);
            path = this.getPath(utilPath, worldManager);

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

    writeToCache(key, value) {
        let creepMemory = Memory.creeps[this.name];
        creepMemory[key] = value;
    }
}

module.exports = CreepAncestor;