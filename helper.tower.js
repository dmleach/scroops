class TowerHelper {

    static activateTowerById(towerId) {
        let gameObject = Game.getObjectById(towerId);

        if (!gameObject || !(gameObject instanceof StructureTower) ) {
            throw new Error('Object ' + towerId + ' is not a valid tower');
        }

        let TowerClass = require('class.tower');
        let tower = new TowerClass(gameObject);

        if (tower) {
            tower.act();
        }
    }

    static activateTowers() {
        // Find all the friendly towers
        let towerIds = this.friendlyTowerIds;

        for (let idxTower in towerIds) {
            this.activateTowerById(towerIds[idxTower]);
        }
    }

    static get friendlyTowerIds() {
        let towerIds = [];
        let LocationHelper = require('helper.location');
        let structureIds = LocationHelper.findIds(FIND_MY_STRUCTURES);

        for (let idxStructure in structureIds) {
            let structure = Game.getObjectById(structureIds[idxStructure]);

            if (structure instanceof StructureTower) {
                towerIds.push(structureIds[idxStructure]);
            }
        }

        return towerIds;
    }

}

module.exports = TowerHelper;
