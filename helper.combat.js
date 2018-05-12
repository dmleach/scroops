class CombatHelper {

    static get enemyIds() {
        let enemyIds = [];

        for (let roomName in Game.rooms) {
            enemyIds = enemyIds.concat(this.getEnemyIdsByRoom(roomName));
        }

        return enemyIds;
    }

    static getEnemyIdsByRoom(roomName) {
        let enemyIds = [];
        let room = Game.rooms[roomName];
        let enemies = room.find(FIND_HOSTILE_CREEPS);

        for (let idxEnemy in enemies) {
            enemyIds.push(enemies[idxEnemy].id);
        }

        return enemyIds;
    }

}

module.exports = CombatHelper;
