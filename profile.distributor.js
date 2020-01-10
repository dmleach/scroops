var profileDistributor = {

    active: true,
    baseBody: [MOVE, CARRY],

    /** @param {Room} room **/
    body: function(room) {
        var bodyParts = this.baseBody;
        var helperCreeps = require('helper.creeps');
        var cost = helperCreeps.bodyPartCost(bodyParts);
        var availableEnergy = room.energyAvailable;

        if (cost > availableEnergy) {
            return false;
        }

        while (cost <= availableEnergy) {
            bodyParts.push(MOVE, CARRY);
            cost = helperCreeps.bodyPartCost(bodyParts);
        }

        bodyParts.pop();
        bodyParts.pop();
        return bodyParts;
    },

    creepName: 'Distributor',
    creepType: 5,
    desiredCount: 3,
    energyType: 'Mover',
    renewable: true,
    roleScript: 'role.distributor',
    spawnGroup: 1,

}

module.exports = profileDistributor;
