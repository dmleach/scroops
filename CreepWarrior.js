let CreepSpenderClass = require('CreepSpender');

class CreepWarrior extends CreepSpenderClass
{
    static get basicBody() {
        return [ATTACK, MOVE];
    }

    static get bodyIncrement() {
        return [ATTACK, MOVE];
    }

    static canSpawn(roomName, worldManager, utilCreep) {
        return true;
    }

    getGiveEnergyTargetId(worldManager) {
        let cachedId = this.readFromCache(this.KEY_GIVE_ENERGY_TARGET_ID);
        this.debug('Cached give energy target id is '+ cachedId);

        let GameObjectClass = require('GameObject');

        if (cachedId !== undefined) {
            let gameObject = new GameObjectClass(cachedId);

            this.debug('Give object structure type is ' + gameObject.structureType);

            if (gameObject.structureType === 'invaderCore') {
                this.debug('Returning give energy target id ' + cachedId + ' from cache');
                return cachedId;
            }

            if (gameObject.structureType === 'container' && gameObject.full === false) {
                this.debug('Returning give energy target id ' + cachedId + ' from cache');
                return cachedId;
            }
        }

        let hostileCreeps = worldManager.getHostileCreepsWorldwide();

        if (hostileCreeps !== undefined && hostileCreeps.length > 0) {
            return hostileCreeps[0].id;
        }

        let invaderCores = worldManager.getInvaderCores();

        if (invaderCores !== undefined && invaderCores.length > 0) {
            return invaderCores[0].id;
        }

        let towers = worldManager.getTowers(this.roomName);

        for (let idxTower = 0; idxTower < towers.length; idxTower++) {
            if (towers[idxTower].store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                return towers[idxTower].id;
            }
        }

        return undefined;
    }

    get mode() {
        return this.MODE_GIVE_ENERGY;
    }

    getInteractionRange(objectId) {
        let gameObject = Game.getObjectById(objectId);

        if (gameObject instanceof Creep && this.gameObject.body.indexOf(RANGED_ATTACK) !== -1) {
            return 3;
        }

        return 1;
    }

    giveEnergyToStructure(structure) {
        if (structure instanceof StructureInvaderCore) {
            let attackResult = this.gameObject.attack(structure);

            if (this.isShowingDebugMessages === false) {
                return attackResult;
            }

            let GameObjectClass = require('GameObject');
            let attackObject = new GameObjectClass(structure.id);
            let ticksToDefeat;

            if (this.attackPower !== 0) {
                ticksToDefeat = Math.ceil(structure.hits / this.attackPower);
            } else {
                ticksToDefeat = 'infinite';
            }

            this.debug('Attacked ' + attackObject.name + ' with ' + structure.hits  + ' hits, ' + ticksToDefeat + ' ticks until destroyed, warrior has ' + this.ticksToLive + ' ticks to live');
            return attackResult;
        }

        return super.giveEnergyToStructure(structure);
    }

    get isShowingDebugMessages() {
        return this.name === 'foo'; //'warrior15186610';
    }

    get shouldClearCacheAfterGiveEnergy() {
        return false;
    }
}

module.exports = CreepWarrior;