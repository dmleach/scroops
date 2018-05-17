let CreepClass = require('class.creep');

const ACTIVITY_SCOUT = 0;
const ACTIVITY_OBSERVE = 1;

class ScoutClass extends CreepClass {

    /**
     * Computes the activity the creep should perform this turn
     */
    get activity () {
        if (this.pos.isEqualTo(this.assignedPosition)) {
            return ACTIVITY_OBSERVE;
        }

        return ACTIVITY_SCOUT;
    }

    /**
     * The position at which this scout has been assigned to observe
     */
    get assignedPosition() {
        if (this.gameObject.memory.assignedPosition) {
            return new RoomPosition(
                this.gameObject.memory.assignedPosition.x,
                this.gameObject.memory.assignedPosition.y,
                this.gameObject.memory.assignedPosition.roomName
            );
        }

        // Find the room the scout should observe
        let RoomHelper = require('helper.room');
        let adjacentRooms = RoomHelper.adjacentRooms;
        let assignedRoom = undefined;

        for (let idxId in adjacentRooms) {
            if (!ScoutClass.isRoomScouted(adjacentRooms[idxId])) {
                assignedRoom = adjacentRooms[idxId]
            }
        }

        // If the scout is in that room, great! Let its current position be its
        // assignment
        if (this.pos.roomName == assignedRoom) {
            this.gameObject.memory.assignedPosition = this.pos;
            return this.pos;
        }

        // Find a path to that room and assign the end of that path to the scout
        let PathHelper = require('helper.path');
        let destination = PathHelper.findToRoom(this.pos, assignedRoom);
        this.gameObject.memory.assignedPosition = destination;
        return destination;
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
            case ACTIVITY_OBSERVE:
                return this.doObserve();
        }

        throw new Error(this.name + ' has no method for activity ' + activity);
    }

    doObserve() {
    }

    doScout() {
        let assignedPosition = this.assignedPosition;

        if (!assignedPosition) {
            return false;
        }

        this.goTo(assignedPosition);
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

        let RoomHelper = require('helper.room');
        let adjacentRooms = RoomHelper.adjacentRooms;

        for (let idxId in adjacentRooms) {
            if (!ScoutClass.isRoomScouted(adjacentRooms[idxId])) {
                this.gameObject.memory.room = adjacentRooms[idxId];
                return adjacentRooms[idxId];
            }
        }

        return undefined;
    }

}

module.exports = ScoutClass;
