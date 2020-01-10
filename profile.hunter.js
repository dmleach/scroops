var profileHunter = {

    active: true,
    baseBody: [MOVE, RANGED_ATTACK],

    /** @param {Room} room **/
    body: function(room) {
        var bodyParts = this.baseBody;
        var helperCreeps = require('helper.creeps');
        var cost = helperCreeps.bodyPartCost(bodyParts);

        if (cost > room.energyAvailable) {
            return false;
        }

        while (cost <= room.energyAvailable) {
            bodyParts.push(MOVE, RANGED_ATTACK);
            cost = helperCreeps.bodyPartCost(bodyParts);
        }

        bodyParts.pop();
        bodyParts.pop();
        return bodyParts;
    },

    creepName: 'Hunter',
    creepType: 8,
    desiredCount: 0,
    energyType: 'Earner',
    renewable: true,
    roleScript: 'role.hunter',
    spawnGroup: 1,

}

module.exports = profileHunter;
