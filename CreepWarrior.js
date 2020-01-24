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

    getGiveEnergyTargetId(roomManager) {
        let hostileCreeps = roomManager.getHostileCreeps();

        if (hostileCreeps !== undefined && hostileCreeps.length > 0) {
            return hostileCreeps[0].id;
        }

        let GameObjectClass = require('GameObject');

        let towers = roomManager.getTowers();
        let towerObject;

        if (towers !== undefined) {
            for (let idxTower = 0; idxTower < towers.length; idxTower++) {
                towerObject = new GameObjectClass(towers[idxTower].id);

                if (towerObject.full === false) {
                    return towers[idxTower].id;
                }
            }
        }

        return undefined;
    }

    getTakeEnergyTargetId(roomManager) {
        let hostileCreeps = roomManager.getHostileCreeps();

        if (hostileCreeps !== undefined && hostileCreeps.length > 0) {
            let towers = roomManager.getTowers();

            if (towers !== undefined && towers.length > 0) {
                return towers[0].id;
            }
        }

        return super.getTakeEnergyTargetId(roomManager);
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