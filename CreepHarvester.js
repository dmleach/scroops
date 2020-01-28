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
        let containers = worldManager.getContainers(this.roomName);

        for (let idxContainer = 0; idxContainer < containers.length; idxContainer++) {
            if (containers[idxContainer].store.getFreeCapacity(RESOURCE_ENERGY) > 0 && this.pos.getRangeTo(containers[idxContainer]) <= 1) {
                return containers[idxContainer].id;
            }
        }

        let UtilCreepClass = require('UtilCreep');
        let utilCreep = new UtilCreepClass(this.pos.roomName);

        if (utilCreep.count > 1) {
            this.debug('Returning own id');
            return this.id;
        }

        let spawns = worldManager.getFriendlySpawns(this.roomName);

        for (let idxSpawn = 0; idxSpawn < spawns.length; idxSpawn++) {
            if (spawns[idxSpawn].store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                return spawns[idxSpawn].id;
            }
        }

        return undefined;
    }

    getTakeEnergyTargetId(worldManager) {
        let sources = worldManager.getSources(this.roomName);

        for (let idxSource = 0; idxSource < sources.length; idxSource++) {
            if (sources[idxSource].energy > 0) {
                return sources[idxSource].id;
            }
        }
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
        return false;
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
}

module.exports = CreepHarvester;