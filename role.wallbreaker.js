var roleWallbreaker = {

    doBreak: function(creep, helperLocations) {
    },

    /** @param {Creep} creep **/
    getActivity: function(creep, helperLocations) {
        if (this.getBreakableWalls(helperLocations).length > 0) {
            return 'Break';
        }

        return false;
    },

    getBreakableWalls: function(helperLocations) {
        var breakableWalls = [];

        for (var idxStructure in helperLocations.getStructures()) {
            var structure = helperLocations.getStructures()[idxStructure];

            if (structure) {
                if (
                    structure.structureType == STRUCTURE_WALL
                    && structure.hits > 0
                    && structure.my == false
                    && structure.room.controller
                ) {
                    if (structure.room.controller.my) {
                        breakableWalls.push(structure);
                    }
                }
            }
        }

        return breakableWalls;
    },

    /** @param {Creep} creep **/
    run: function(creep, helperLocations = undefined) {
        creep.memory.activity = this.getActivity(creep, helperLocations);

        if (creep.memory.activity == 'Break') {
            this.doBreak(creep, helperLocations);
        }
	}

}

module.exports = roleWallbreaker;
