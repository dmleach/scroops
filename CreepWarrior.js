let CreepSpenderClass = require('CreepSpender');

class CreepWarrior extends CreepSpenderClass
{
    static get basicBody() {
        return [ATTACK, MOVE, CARRY, MOVE];
    }

    static get bodyIncrement() {
        return [RANGED_ATTACK, MOVE, CARRY, MOVE];
    }

    get canTakeEnergyWhenRoomNotFull() {
        return true;
    }

    getGiveEnergyTargetId(worldManager) {
        let hostileCreeps = worldManager.getHostileCreeps(this.roomName);

        if (hostileCreeps !== undefined && hostileCreeps.length > 0) {
            return hostileCreeps[0].id;
        }

        let towers = worldManager.getTowers(this.roomName);

        for (let idxTower = 0; idxTower < towers.length; idxTower++) {
            if (towers[idxTower].store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                return towers[idxTower].id;
            }
        }

        return undefined;
    }

    getTakeEnergyTargetId(worldManager) {
        let roomManager = worldManager.getRoomManager(this.roomName);
        let hostileCreeps = roomManager.getHostileCreeps();

        if (hostileCreeps !== undefined && hostileCreeps.length > 0) {
            let towers = roomManager.getTowers();

            if (towers !== undefined && towers.length > 0) {
                return towers[0].id;
            }
        }

        return super.getTakeEnergyTargetId(worldManager);
    }

    getInteractionRange(objectId) {
        let gameObject = Game.getObjectById(objectId);

        if (gameObject instanceof Creep && this.gameObject.body.indexOf(RANGED_ATTACK) !== -1) {
            return 3;
        }

        return 1;
    }
}

module.exports = CreepWarrior;