var ProfiledClass = require('class.profiled');

class CombatHelper extends ProfiledClass {

    static get enemyIds() {
        this.incrementProfilerCount('CombatHelper.enemyIds');

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
        this.incrementProfilerCount('CombatHelper.getEnemyIdsByRoom');

        let LocationHelper = require('helper.location');
        return LocationHelper.findIds(FIND_HOSTILE_CREEPS, roomName);
    }

    static getHostileEnemyIdsByRoom(roomName) {
        this.incrementProfilerCount('CombatHelper.getHostileEnemyIdsByRoom');

        let hostileIds = [];
        let enemyIds = this.getEnemyIdsByRoom(roomName);

        for (let idxId in enemyIds) {
            let creep = Game.getObjectById(enemyIds[idxId]);

            if (creep) {
                if (this.isCreepHostile(creep)) {
                    hostileIds.push(enemyIds[idxId]);
                }
            }
        }

        return hostileIds;
    }

    static getTowerIdsByRoom(roomName) {
        this.incrementProfilerCount('CombatHelper.getTowerIdsByRoom');

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

    static isCreepHostile(creep) {
        this.incrementProfilerCount('CombatHelper.isCreepHostile');

        let hostileParts = [ATTACK, RANGED_ATTACK];

        if (!(creep instanceof Creep)) {
            throw new Error('Value given to isCreepHostile must be of type Creep');
        }

        for (let idxBody in creep.body) {
            if (hostileParts.indexOf(creep.body[idxBody].type) !== -1) {
                return true;
            }
        }

        return false;
    }

}

module.exports = CombatHelper;
