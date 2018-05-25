let BaseClass = require('class.base');

class TowerHelper extends BaseClass {

    static activateTowerById(towerId) {
        this.incrementProfilerCount('TowerHelper.activateTowerById');

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
        this.incrementProfilerCount('TowerHelper.activateTowers');

        // Find all the friendly towers
        let towerIds = this.friendlyTowerIds;

        for (let idxTower in towerIds) {
            this.activateTowerById(towerIds[idxTower]);
        }
    }

    static get friendlyTowerIds() {
        this.incrementProfilerCount('TowerHelper.friendlyTowerIds');

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

    static getFriendlyTowerIdsByRoom(roomName) {
        this.incrementProfilerCount('TowerHelper.getFriendlyTowerIdsByRoom');

        let roomTowerIds = [];
        let towerIds = this.friendlyTowerIds;

        for (let idxId in towerIds) {
            let tower = Game.getObjectById(towerIds[idxId]);

            if (tower.pos.roomName == roomName) {
                roomTowerIds.push(towerIds[idxId]);
            }
        }

        return roomTowerIds;
    }

}

module.exports = TowerHelper;
