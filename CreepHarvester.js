let CreepEarnerClass = require('CreepEarner');

class CreepHarvester extends CreepEarnerClass
{
    constructor(id) {
        super(id);
        // this.inDebugMode = true;
    }

    static get basicBody() {
        return [WORK, CARRY, MOVE];
    }

    static get bodyIncrement() {
        return [WORK];
    }

    getGiveEnergyTargetId(worldManager) {
        let cachedId = super.getGiveEnergyTargetId(worldManager);

        if (this.isValidGiveEnergyTargetId(cachedId)) {
            this.debug('Returning give energy target id ' + cachedId + ' from cache');
            return cachedId;
        }

        let containers = worldManager.getContainers(this.roomName);

        for (let idxContainer = 0; idxContainer < containers.length; idxContainer++) {
            if (containers[idxContainer].store.getFreeCapacity(RESOURCE_ENERGY) > 0 && this.pos.getRangeTo(containers[idxContainer]) <= 1) {
                this.debug('Returning calculated give energy target id ' + containers[idxContainer].id);
                return containers[idxContainer].id;
            }
        }

        let UtilCreepClass = require('UtilCreep');
        let utilCreep = new UtilCreepClass(this.pos.roomName);

        if (utilCreep.count > 1) {
            this.debug('Returning own id as give energy target id');
            return this.id;
        }

        let spawns = worldManager.getFriendlySpawns(this.roomName);

        for (let idxSpawn = 0; idxSpawn < spawns.length; idxSpawn++) {
            if (spawns[idxSpawn].store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                this.debug('Returning calculated give energy target id ' + spawns[idxSpawn].id);
                return spawns[idxSpawn].id;
            }
        }

        return undefined;
    }

    getTakeEnergyTargetId(worldManager) {
        let cachedId = super.getTakeEnergyTargetId(worldManager);

        if (this.isValidTakeEnergyTargetId(cachedId)) {
            this.debug('Returning take energy target id ' + cachedId + ' from cache');
            return cachedId;
        }

        let sources = worldManager.getSources(this.roomName);

        for (let idxSource = 0; idxSource < sources.length; idxSource++) {
            if (this.isValidTakeEnergyTargetId(sources[idxSource].id)) {
                this.debug('Returning calculated take energy target id ' + sources[idxSource].id);
                return sources[idxSource].id;
            }
        }

        this.debug('Cannot find a valid take energy target, returning undefined');
        return undefined;
    }

    giveEnergy() {
        let giveEnergyTarget = Game.getObjectById(this.giveEnergyTargetId);

        if (giveEnergyTarget instanceof StructureContainer && this.pos.getRangeTo(giveEnergyTarget) > 2) {
            this.gameObject.drop(RESOURCE_ENERGY);
        }

        super.giveEnergy();
    }

    giveEnergyToCreep(creep) {
        this.gameObject.drop(RESOURCE_ENERGY);
    }

    get isShowingDebugMessages() {
        return true;
    }

    get isUsingUpdateGiveEnergyFunction() {
        return true;
    }

    get isUsingUpdateTakeEnergyFunction() {
        return true;
    }

    isValidGiveEnergyTargetId(id) {
        if (id === undefined) {
            return false;
        }

        let gameObject = Game.getObjectById(id);

        if (gameObject instanceof StructureContainer) {
            if (gameObject.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && this.pos.getRangeTo(gameObject.pos) <= 1) {
                return true;
            }
        } else if (id === this.id) {
            return true;
        } else if (gameObject instanceof StructureSpawn) {
            if (gameObject.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                return true;
            }
        }

        return false;
    }

    isValidTakeEnergyTargetId(id) {
        if (id === undefined) {
            return false;
        }

        let gameObject = Game.getObjectById(id);

        if (gameObject instanceof Source === false) {
            return false;
        }

        let GameObjectClass = require('GameObject');
        gameObject = new GameObjectClass(id);
        return gameObject.isInFriendlyRoom;
    }

    get mode() {
        let mode = this.MODE_TAKE_ENERGY;
        let load = this.gameObject.store.getUsedCapacity(RESOURCE_ENERGY);

        let harvestYield = 0;

        this.gameObject.body.forEach(function(bodyPart) {
            if (bodyPart.type === WORK) {
                harvestYield += 2;
            }
        });

        let capacity = this.gameObject.store.getCapacity(RESOURCE_ENERGY);

        if (load + harvestYield >= capacity) {
            mode = this.MODE_GIVE_ENERGY;
        }

        return mode;
    }

    get movePriority() {
        return 100;
    }

    get shouldClearCacheAfterTakeEnergy() {
        return false;
    }
}

module.exports = CreepHarvester;