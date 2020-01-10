var roleTower = {

    doAttack: function(tower) {
        var enemies = tower.room.find(FIND_HOSTILE_CREEPS);
        var helperCreeps = require('helper.creeps');

        for (var idxEnemy = 0; idxEnemy < enemies.length; idxEnemy++) {
            var enemy = enemies[idxEnemy];

            if (helperCreeps.isHostile(enemy)) {
                tower.attack(enemy);
            }
        }
    },

    doRepair: function(tower) {
        var helperStructures = require('helper.structures');
        var roomStructures = helperStructures.getStructures(tower.room);
        var leastStructure = false;

        for (var idxStructure in roomStructures) {
            var roomStructure = roomStructures[idxStructure];

            if (roomStructure.hits < roomStructure.hitsMax && roomStructure.hits < 100000) {
                if (leastStructure === false || roomStructure.hits < leastStructure.hits) {
                    leastStructure = roomStructure;
                }
            }
        }

        if (leastStructure) {
            tower.repair(leastStructure);
        }
    },

    getActivity: function(tower) {
        var enemies = tower.room.find(FIND_HOSTILE_CREEPS);

        if (enemies.length > 0) {
            return 'Attack';
        }

        return 'Repair';
    },

    /**
      * @param {StructureTower} tower
     **/
    run: function(tower) {
        var activity = this.getActivity(tower);

        if (activity == 'Attack') {
            this.doAttack(tower);
        } else if (activity == 'Repair') {
            this.doRepair(tower);
        }
	}
};

module.exports = roleTower;
