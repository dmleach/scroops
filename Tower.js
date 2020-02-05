let GameObjectClass = require('GameObject');

class Tower extends GameObjectClass
{
    getGiveEnergyTargetId(worldManager, utilCreep) {
        let hostileCreeps = worldManager.getHostileCreeps(this.roomName);

        if (hostileCreeps !== undefined && hostileCreeps.length > 0) {
            return hostileCreeps[0].id;
        }

        let structures = worldManager.getStructures(this.roomName);
        let structure;
        let lowestHitsId = undefined;
        let lowestHits = 10000000;

        for (let idxStructure = 0; idxStructure < structures.length; idxStructure++) {
            structure = structures[idxStructure];

            if (structure.my === false) {
                continue;
            }

            if (structure.hits < structure.hitsMax) {
                if (structure.hits < lowestHits) {
                    lowestHitsId = structure.id;
                    lowestHits = structure.hits;
                }
            }
        }

        if (lowestHitsId !== undefined && lowestHits < 100000) {
            return lowestHitsId;
        }

        return undefined;
    }

    giveEnergy() {
        let giveEnergyTarget = Game.getObjectById(this.giveEnergyTargetId);
        let giveResult;

        if (giveEnergyTarget instanceof Creep) {
            if (giveEnergyTarget.my) {
                giveResult = this.gameObject.heal(giveEnergyTarget);
            } else {
                giveResult = this.gameObject.attack(giveEnergyTarget);
            }
        } else if (giveEnergyTarget instanceof Structure) {
            giveResult = this.gameObject.repair(giveEnergyTarget);
        }

        if (giveResult === OK) {
            return;
        }

        let message;

        switch(giveResult) {
            case ERR_NOT_OWNER: message = 'owner ' + this.giveEnergyTargetId; break;
            case ERR_NOT_ENOUGH_ENERGY: message =  'energy'; break;
            case ERR_INVALID_TARGET: message = 'target ' + this.giveEnergyTargetId; break;
            case ERR_RCL_NOT_ENOUGH: message = 'RCL'; break;
        }

        this.debug(message);
    }

    get isShowingDebugMessages() {
        return false;
    }

    work() {
        if (this.giveEnergyTargetId === undefined) {
            return;
        }

        this.giveEnergy();
    }
}

module.exports = Tower;