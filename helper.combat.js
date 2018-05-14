class CombatHelper {

    static get enemyIds() {
        let enemyIds = [];

        for (let roomName in Game.rooms) {
            enemyIds = enemyIds.concat(this.getEnemyIdsByRoom(roomName));
        }

        return enemyIds;
    }

    static getEnemyIdsByRoom(roomName) {
        let LocationHelper = require('helper.location');
        return LocationHelper.findIds(FIND_HOSTILE_CREEPS, roomName);
    }

    static getTowerIdsByRoom(roomName) {
        let towerIds = [];
        let LocationHelper = require('helper.location');
        let siteIds = LocationHelper.findIds(FIND_STRUCTURES, roomName);

        for (let idxId in siteIds) {
            let gameObject = Game.getObjectById(siteIds[idxId]);

            if (gameObject instanceof StructureTower) {
                towerIds.push(siteIds[idxId]);
            }
        }

        return towerIds;
    }

}

module.exports = CombatHelper;
