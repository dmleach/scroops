var ActiveClass = require('class.active');

class TowerClass extends ActiveClass {

    /**
     * All the towers in a given room should be engaged in the same activity.
     * This function determines that activity for a given room
     */
    get activity() {
        let room = Game.rooms[this.pos.roomName];
        let enemies = room.find(FIND_HOSTILE_CREEPS);

        if (enemies.length > 0) {
            return 'Attack';
        }

        return 'Repair';
    }

    /**
     * Do the given activity. This method connects the activity constant values
     * to the methods of the creep object
     */
    doActivityMethod(activity) {
        switch (activity) {
            case 'Attack':
                return this.doAttack();
            case 'Repair':
                return this.doRepair();
        }

        throw new Error(this.name + ' has no method for activity ' + activity);
    }

    doAttack() {
    }

    doRepair() {        
    }

}

module.exports = TowerClass;
