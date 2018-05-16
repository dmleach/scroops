class CombatHelper {

    static get enemyIds() {
        let enemyIds = [];
        let LocationHelper = require('helper.location');

        for (let roomName in Game.rooms) {
            let roomEnemyIds = this.getEnemyIdsByRoom(roomName);

            for (let idxId in roomEnemyIds) {
                let enemy = Game.getObjectById(roomEnemyIds[idxId]);

                // Some enemies stay on the edge of the screen to "taunt" you
                // into wasting resources on attacking them
                if (!LocationHelper.isExit(enemy.pos)) {
                    enemyIds.push(roomEnemyIds[idxId]);
                }
            }

            enemyIds = enemyIds.concat();
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
