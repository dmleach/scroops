/** Profiling code: https://github.com/screepers/screeps-profiler */
// Any modules that you use that modify the game's prototypes should be require'd
// before you require the profiler.
const profiler = require('screeps-profiler');

let classesToProfile = [
    'CreepAncestor', 'CreepBuilder', 'CreepDistributor', 'CreepEarner', 'CreepHarvester',
    'CreepImporter', 'CreepScavenger', 'CreepScout', 'CreepSpender', 'CreepUpgrader',
    'CreepWarrior', 'GameObject', 'MemoryAccessor', 'Role', 'RoomManager',
    'ScroopsObject', 'Tower', 'UtilPosition', 'UtilSort', 'UtilSpawn',
    'WorldManager'
];

let classToProfile;

for (let idxClass = 0; idxClass < classesToProfile.length; idxClass++) {
    classToProfile = require(classesToProfile[idxClass]);
    profiler.registerClass(classToProfile, classesToProfile[idxClass]);
}

//
// This line monkey patches the global prototypes.
profiler.enable();

module.exports.loop = function() {
    profiler.wrap(function() {
        // Main.js logic should go here.

        console.log('======= Beginning tick ' + Game.time + ' =======');

        // Clear memory allocated for dead creeps
        for (let name in Memory.creeps) {
            if (Game.creeps[name] === undefined) {
                delete Memory.creeps[name];
            }
        }

        // Iterate through the player's spawns and spawn creeps
        let WorldManagerClass = require('WorldManager');
        let worldManager = new WorldManagerClass();

        let UtilCreepClass = require('UtilCreep');
        let utilCreep = new UtilCreepClass(Game.creeps);

        let UtilSpawnClass = require('UtilSpawn');
        let utilSpawn;

        for (let spawnName in Game.spawns) {
            // roomManager = worldManager.getRoomManager(Game.spawns[spawnName].pos.roomName);
            utilSpawn = new UtilSpawnClass(spawnName);
            utilSpawn.spawnCreep(worldManager, utilCreep);
        }

        let UtilPathClass = require('UtilPath');
        let utilPath = new UtilPathClass();

        let Role = require('Role');
        let GameObjectClass = require('GameObject');
        let gameObject;

        let roleClass;
        let creeps = [];

        for (let creepName in Game.creeps) {
            roleClass = Role.getCreepClassByCreepId(Game.creeps[creepName].id);

            if (roleClass === undefined) {
                continue;
            }

            creeps.push(new roleClass(Game.creeps[creepName].id));
        }

        let UtilSortClass = require('UtilSort');
        let utilSort = new UtilSortClass();
        utilSort.sort(creeps, 'movePriority', utilSort.SORT_DESCENDING);

        let workGroup;
        let creep;

        while (creeps.length > 0) {
            creep = creeps.shift();

            workGroup = [creep];

            while (creeps.length > 0 && creeps[0].movePriority === workGroup[0].movePriority) {
                creep = creeps.shift();
                workGroup.push(creep);
            }

            utilSort.sort(workGroup, 'energy', utilSort.SORT_DESCENDING);

            for (let idxCreep = 0; idxCreep < workGroup.length; idxCreep++) {
                creep = workGroup[idxCreep];
                creep.debug('******* Beginning turn for tick ' + Game.time + ' *******');

                if (creep.isUsingUpdateTakeEnergyFunction) {
                    // creep.debug('CACHE VALUES BEFORE UPDATE TAKE');
                    // creep.debugCache();
                    creep.updateTakeEnergyTarget(worldManager, utilPath);
                } else {
                    creep.setTakeEnergyTargetId(creep.getTakeEnergyTargetId(worldManager), worldManager);
                }

                // creep.takeEnergyPos = creep.getTakeEnergyPos(worldManager);

                if (creep.isUsingUpdateGiveEnergyFunction) {
                    // creep.debug('CACHE VALUES BEFORE UPDATE GIVE');
                    // creep.debugCache();
                    creep.updateGiveEnergyTarget(worldManager, utilPath);

                    // creep.debug('CACHE VALUES AFTER UPDATES');
                    // creep.debugCache();
                } else {
                    creep.setGiveEnergyTargetId(creep.getGiveEnergyTargetId(worldManager));

                    if (creep.giveEnergyTargetId !== undefined) {
                        gameObject = new GameObjectClass(creep.giveEnergyTargetId);
                        // creep.debug('Giving energy to ' + gameObject.name);
                        creep.giveEnergyPos = creep.getClosestInteractionPositionById(creep.giveEnergyTargetId, worldManager);
                        creep.debug('Give energy position is ' + creep.giveEnergyPos);
                    } else {
                        creep.debug('Object to give energy to is undefined');
                    }
                }

                creep.work(worldManager, utilPath);

                creep.debug('------- Ending turn for tick ' + Game.time + ' -------');
            }
        }

        // Iterate through each of the game's towers
        let TowerClass = require('Tower');
        let tower;

        for (let roomName in Game.rooms) {
            let towers = worldManager.getTowers(roomName);

            for (let idxTower = 0; idxTower < towers.length; idxTower++) {
                tower = new TowerClass(towers[idxTower].id);
                tower.debug('******* Beginning turn for tick ' + Game.time + ' *******');

                tower.giveEnergyTargetId = tower.getGiveEnergyTargetId(worldManager);
                tower.debug('giveEnergyTargetId is ' + tower.giveEnergyTargetId);
                tower.work();
                tower.debug('------- Ending turn for tick ' + Game.time + ' -------');
            }
        }
    })
}