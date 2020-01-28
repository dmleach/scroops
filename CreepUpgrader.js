let CreepSpenderClass = require('CreepSpender');

class CreepUpgrader extends CreepSpenderClass
{
    static get basicBody() {
        return [WORK, MOVE, CARRY]
    }

    static get bodyIncrement() {
        return [WORK, CARRY];
    }

    getGiveEnergyTargetId(worldManager) {
        let giveEnergyTargetId = super.getGiveEnergyTargetId(worldManager);

        if (giveEnergyTargetId !== undefined) {
            return giveEnergyTargetId;
        }

        return Game.rooms[this.roomName].controller.id;
    }

    getInteractionRange(objectId) {
        if (this.mode === this.MODE_TAKE_ENERGY) {
            return 1;
        }

        let gameObject = Game.getObjectById(objectId);

        if (gameObject instanceof StructureController) {
            return 3;
        }

        return 1;
    }

    // static numberToSpawn(utilCreep) {
    //     let Role = require('Role');
    //
    //     if (utilCreep.countByRole(Role.BUILDER) > 0 && utilCreep.countByRole(Role.DISTRIBUTOR) > 0) {
    //         return 2;
    //     }
    //
    //     return 1;
    // }
}

module.exports = CreepUpgrader;