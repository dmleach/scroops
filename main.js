console.log('======= Beginning tick ' + Game.time + ' =======');

// Clear memory allocated for dead creeps
for (let name in Memory.creeps) {
    if (Game.creeps[name] === undefined) {
        delete Memory.creeps[name];
    }
}

// Iterate through the player's spawns and spawn creeps
let spawns = Game.spawns;

let WorldManagerClass = require('WorldManager');
let worldManager = new WorldManagerClass();

let roomManager;

let UtilCreepClass = require('UtilCreep');
let utilCreep = new UtilCreepClass(Game.creeps);

let UtilSpawnClass = require('UtilSpawn');
let utilSpawn;

for (let idxSpawn = 0; idxSpawn < spawns.length; idxSpawn++) {
    roomManager = worldManager.getRoomManager(spawns[idxSpawn].pos.roomName);
    utilSpawn = new UtilSpawnClass(spawns[idxSpawn]);
    utilSpawn.spawnCreep(roomManager, utilCreep);
}

let UtilPathClass = require('UtilPath');
let utilPath = new UtilPathClass();

let Role = require('Role');
let GameObjectClass = require('GameObject');
let gameObject;

let creepId;
let roleClass;
let creep;

// Iterate through each of the game's creeps
for (let idxCreep = 0; idxCreep < utilCreep.creepIds.length; idxCreep++) {
    creepId = utilCreep.creepIds[idxCreep];

    if (creepId === undefined || creepId === null) {
        continue;
    }

    roleClass = Role.getCreepClassByCreepId(creepId);

    if (roleClass === undefined) {
        continue;
    }

    creep = new roleClass(creepId);
    creep.debug('******* Beginning turn for tick ' + Game.time + ' *******');

    roomManager = worldManager.getRoomManager(creep.pos.roomName);

    creep.takeEnergyTargetId = creep.getTakeEnergyTargetId(roomManager);

    if (creep.takeEnergyTargetId !== undefined) {
        gameObject = new GameObjectClass(creep.takeEnergyTargetId);
        creep.debug('Taking energy from ' + gameObject.name);
        creep.takeEnergyPos = creep.getClosestInteractionPositionById(creep.takeEnergyTargetId);
    } else {
        creep.debug('Object to take energy from is undefined');
    }

    creep.giveEnergyTargetId = creep.getGiveEnergyTargetId(roomManager);

    if (creep.giveEnergyTargetId !== undefined) {
        gameObject = new GameObjectClass(creep.giveEnergyTargetId);
        creep.debug('Giving energy to ' + gameObject.name);
        creep.giveEnergyPos = creep.getClosestInteractionPositionById(creep.giveEnergyTargetId);
        creep.debug('Give energy position is ' + creep.giveEnergyPos);
    } else {
        creep.debug('Object to give energy to is undefined');
    }

    creep.work(roomManager, utilPath);

    creep.debug('------- Ending turn for tick ' + Game.time + ' -------');

}

// Iterate through each of the game's towers
let TowerClass = require('Tower');
let tower;

for (let idxTower = 0; idxTower < roomManager.getTowers().length; idxTower++) {
    tower = new TowerClass(roomManager.getTowers()[idxTower].id);
    tower.debug('******* Beginning turn for tick ' + Game.time + ' *******');

    tower.giveEnergyTargetId = tower.getGiveEnergyTargetId(roomManager);
    tower.debug('giveEnergyTargetId is ' + tower.giveEnergyTargetId);
    tower.work();
    tower.debug('------- Ending turn for tick ' + Game.time + ' -------');
}