var roleHunter = {

    doDeposit: function(creep) {
        var helperEnergy = require('helper.energy');
        depositSite = helperEnergy.calculateDepositSite(creep);

        if (depositSite !== false) {
            if (creep.transfer(depositSite, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(depositSite);
            }
        }
    },

    doHunt: function(creep) {
        var enemy = Game.getObjectById(creep.memory.target);

        if (!enemy) {
            creep.memory.target = undefined;
            return false;
        }

        var path = creep.pos.findPathTo(enemy);
        var helperExit = require('helper.exit');

        if (path.length > 3 || helperExit.isExit(path[path.length - 1])) {
            creep.moveTo(enemy);
        } else if (path.length == 3) {
            var attackResult = creep.rangedAttack(enemy);
        } else if (path.length < 3) {
            var direction = path[0].direction;

            if (direction <= 4) {
                creep.move(direction + 4);
            } else {
                creep.move(direction - 4);
            }
        }
    },

    doPartner: function(creep) {
        // Look for other hunters
        var helperCreeps = require('helper.creeps');
        var helperProfiles = require('helper.profiles');
        var hunters = helperCreeps.find(helperProfiles.hunter);

        if (hunters.length == 0) {
            return false;
        }

        // Find a hunter that doesn't have a partner
        for (var idxHunter in hunters) {
            var hunter = hunters[idxHunter];

            if (hunter.memory.partner == undefined) {
                creep.memory.partner = hunter.id;
                hunter.memory.partner = creep.id;
            }
        }
    },

    doPlan: function(creep) {
        // Look for enemiess in the visible rooms
        var closestEnemy = false;
        var closestEnemyDistance = Infinity;

        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            var enemies = room.find(FIND_HOSTILE_CREEPS);

            for (var idxEnemies in enemies) {
                var enemy = enemies[idxEnemies];

                // if (enemy.owner.username == 'Source Keeper') {
                    var distance = creep.pos.findPathTo(enemy.pos).length;

                    if (distance < closestEnemyDistance) {
                        closestEnemy = enemy;
                        closestEnemyDistance = distance;
                    }
                // }
            }

            if (closestEnemy == false) {
                creep.memory.target = undefined;
            }

            creep.memory.target = closestEnemy.id;
        }
    },

    doTrophy: function(creep) {
        var tombstones = creep.pos.findInRange(FIND_TOMBSTONES, 3);
        var withdrawResult = creep.withdraw (tombstones[0], RESOURCE_ENERGY);

        if (withdrawResult == ERR_NOT_IN_RANGE) {
            creep.moveTo(tombstones[0]);
        }
    },

    getActivity: function(creep) {
        if (!creep.memory.target) {
            return 'Plan';
        }

        return 'Hunt';
    },

    getDestinationPosition: function(creep) {
        return new RoomPosition(
            creep.memory.destination.x,
            creep.memory.destination.y,
            creep.memory.destination.roomName
        );
    },

    /**
      * @param {Creep} creep
     **/
    run: function(creep, helperLocations = undefined) {
        creep.memory.activity = this.getActivity(creep);

        if (creep.memory.activity == 'Hunt') {
            this.doHunt(creep);
        } else if (creep.memory.activity == 'Plan') {
            this.doPlan(creep);
        }
	}
};

module.exports = roleHunter;
