class RepairHelper {

    /**
     * Returns the ids of all friendly structures in visible rooms that are not
     * at full hit points
     */
    static get damagedStructureIds() {
        let damagedIds = [];

        let LocationHelper = require('helper.location');
        let structureIds = LocationHelper.findIds(FIND_STRUCTURES);

        for (let idxId in structureIds) {
            if (this.isValidRepairSiteId(structureIds[idxId])) {
                damagedIds.push(structureIds[idxId]);
            }
        }

        return damagedIds;
    }

    static isValidRepairSiteId(id) {
        let structure = Game.getObjectById(id);

        if (!structure) {
            return false;
        }

        if (!(structure instanceof Structure)) {
            return false;
        }

        if (structure.hits == structure.hitsMax) {
            return false;
        }

        if (structure.room.controller) {
            if (!structure.room.controller.my) {
                return false;
            }
        }

        return true;
    }

    static get mostDamagedStructureId() {
        let damagedStructureIds = this.damagedStructureIds;
        let mostDamagedStructureId = false;
        let mostDamagedStructureDeficit = 0;

        for (let idxId in damagedStructureIds) {
            let gameObject = Game.getObjectById(damagedStructureIds[idxId]);

            if (gameObject) {
                if (gameObject instanceof Structure) {
                    let deficit = gameObject.hitsMax - gameObject.hits;

                    if (deficit > mostDamagedStructureDeficit) {
                        mostDamagedStructureId = damagedStructureIds[idxId];
                        mostDamagedStructureDeficit = deficit;
                    }
                }
            }
        }

        return mostDamagedStructureId;
    }

}

module.exports = RepairHelper;
