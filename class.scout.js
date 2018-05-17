let CreepClass = require('class.creep');

const ACTIVITY_SCOUT = 0;

class ScoutClass extends CreepClass {

    /**
     * Computes the activity the creep should perform this turn
     */
    get activity () {
        return ACTIVITY_SCOUT;
    }

    /**
     * The room this scout has been assigned to watch
     */
    get assignedRoom() {
        return this.gameObject.memory.room;
    }

    /**
     * The body parts the most simplest version of a harvester should have
     */
    static get bodyBase() {
        return [MOVE];
    }

    /**
     * Do the given activity. This method connects the activity constant values
     * to methods of the creep object
     */
    doActivityMethod(activity) {
        switch (activity) {
            case ACTIVITY_SCOUT:
                return this.doScout();
        }

        throw new Error(this.name + ' has no method for activity ' + activity);
    }

    doScout() {
        let assignedRoom = this.roomAssignment;
        console.log(this.name + ' should scout ' + assignedRoom);


    }

    /**
     * Returns true if any scout has the given room as its assigned room
     */
    static isRoomScouted(roomName) {
        let CreepHelper = require('helper.creep');
        let scoutIds = CreepHelper.getCreepIdsByRole(this.role);

        for (let idxId in scoutIds) {
            let scout = CreepHelper.createCreepById(scoutIds[idxId]);

            if (scout.assignedRoom == roomName) {
                return true;
            }
        }

        return false;
    }

    /**
     * The minimum number of creeps of this role that should be in play
     */
    static get minimumCount() {
        return 2;
    }

    static get role() {
        return 'Scout';
    }

    /**
     * Gets the scout's assignment from cache, or assigns a room to the scout
     * and caches it if nothing is already saved
     */
    get roomAssignment() {
        if (this.assignedRoom) {
            return this.assignedRoom;
        }

        let LocationHelper = require('helper.location');
        let adjacentRooms = LocationHelper.adjacentRooms;

        for (let idxId in adjacentRooms) {
            if (!ScoutClass.isRoomScouted(adjacentRooms[idxId])) {
                this.gameObject.memory.room = assignedRoom;
                return adjacentRooms[idxId];
            }
        }

        return undefined;
    }

}

module.exports = ScoutClass;
