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

}

module.exports = CombatHelper;
