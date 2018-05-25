var ProfiledClass = require('class.profiled');

class RepairHelper extends ProfiledClass {

    /**
     * Returns the ids of all friendly structures in visible rooms that are not
     * at full hit points
     */
    static get damagedStructureIds() {
        this.incrementProfilerCount('RepairHelper.damagedStructureIds');

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
        this.incrementProfilerCount('RepairHelper.isValidRepairSiteId');

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

    static get weakestDamagedStructureId() {
        this.incrementProfilerCount('RepairHelper.weakestDamagedStructureId');

        let damagedStructureIds = this.damagedStructureIds;
        let weakestDamagedStructureId = false;
        let weakestDamagedStructureHits = Infinity;

        for (let idxId in damagedStructureIds) {
            let gameObject = Game.getObjectById(damagedStructureIds[idxId]);

            if (gameObject) {
                if (gameObject instanceof Structure) {
                    let deficit = gameObject.hitsMax - gameObject.hits;

                    if ( (gameObject.hits < gameObject.hitsMax) && (gameObject.hits < weakestDamagedStructureHits) ) {
                        weakestDamagedStructureId = damagedStructureIds[idxId];
                        weakestDamagedStructureHits = gameObject.hits;
                    }
                }
            }
        }

        return weakestDamagedStructureId;
    }

}

module.exports = RepairHelper;
