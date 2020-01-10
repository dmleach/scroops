var profileScavenger = {

    active: true,
    baseBody: [MOVE, CARRY],

    /** @param {Room} room **/
    body: function(room) {
        var bodyParts = this.baseBody;
        var helperCreeps = require('helper.creeps');
        var cost = helperCreeps.bodyPartCost(bodyParts);

        if (cost > room.energyAvailable) {
            return false;
        }

        while (cost <= room.energyAvailable) {
            bodyParts.push(MOVE, CARRY);
            cost = helperCreeps.bodyPartCost(bodyParts);
        }

        bodyParts.pop();
        bodyParts.pop();
        return bodyParts;
    },

    creepName: 'Scavenger',
    creepType: 9,
    desiredCount: 1,
    energyType: 'Mover',
    renewable: true,
    roleScript: 'role.scavenger',
    spawnGroup: 1,

}

module.exports = profileScavenger;
