let CreepSpenderClass = require('CreepSpender');

class CreepBuilder extends CreepSpenderClass
{
    static get basicBody() {
        return [WORK, MOVE, CARRY, MOVE];
    }

    static get bodyIncrement() {
        return [WORK, MOVE, CARRY, MOVE];
    }

    getGiveEnergyTargetId(worldManager) {
        this.debug('Finding what I should give energy to');
        // let giveEnergyTargetId = super.getGiveEnergyTargetId(roomManager);
        //
        // if (giveEnergyTargetId !== undefined) {
        //     return giveEnergyTargetId;
        // }

        if (this.energy === 0) {
            this.debug('I have no energy to give this turn');
            return undefined;
        }

        let GameObjectClass = require('GameObject');

        let constructionSites = worldManager.getConstructionSites(this.roomName);

        for (let idxSite = 0; idxSite < constructionSites.length; idxSite++) {
            if (constructionSites[idxSite].progress < constructionSites[idxSite].progressTotal) {
                let constructionSiteObject = new GameObjectClass(constructionSites[idxSite].id);
                this.debug('Giving energy to ' + constructionSiteObject.name);
                return constructionSites[idxSite].id;
            }
        }

        let lowestHitsId = undefined;
        let lowestHits = 10000000;
        let structures = worldManager.getStructures(this.roomName);

        for (let idxStructure = 0; idxStructure < structures.length; idxStructure++) {
            if (structures[idxStructure].hits < structures[idxStructure].hitsMax) {
                if (structures[idxStructure].hits < lowestHits) {
                    lowestHitsId = structures[idxStructure].id;
                    lowestHits = structures[idxStructure].hits;
                }
            }
        }

        if (lowestHitsId !== undefined && lowestHits < 100000) {
            return lowestHitsId;
        }

        let Role = require('Role');
        let CreepUpgraderClass = Role.getCreepClassByRole(Role.UPGRADER);
        let creepUpgrader = new CreepUpgraderClass(this.id);
        return creepUpgrader.getGiveEnergyTargetId(worldManager);
    }

    getInteractionRange(objectId) {
        let GameObjectClass = require('GameObject');
        let interactionObject = new GameObjectClass(objectId);
        this.debug('Getting interaction range to ' + interactionObject.name);

        if (this.mode === this.MODE_TAKE_ENERGY) {
            return 1;
        }

        if (interactionObject.gameObject instanceof ConstructionSite || interactionObject.gameObject instanceof Structure) {
            return 3;
        }

        return 1;
    }

    giveEnergyToContainer(container) {
        return this.gameObject.repair(container);
    }

    giveEnergyToStructure(structure) {
        if (structure.hits < structure.hitsMax) {
            return this.gameObject.repair(structure);
        } else {
            return this.gameObject.transfer(structure, RESOURCE_ENERGY);
        }
    }

    get isShowingDebugMessages() {
        return false;
    }

    // static numberToSpawn(utilCreep) {
    //     let Role = require('Role');
    //
    //     if (utilCreep.countByRole(Role.DISTRIBUTOR) > 0 && utilCreep.countByRole(Role.UPGRADER) > 1) {
    //         return 2;
    //     }
    //
    //     return 1;
    // }
}

module.exports = CreepBuilder;