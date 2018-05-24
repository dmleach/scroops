var ActiveClass = require('class.active');

class TowerClass extends ActiveClass {

    /**
     * All the towers in a given room should be engaged in the same activity.
     * This function determines that activity for a given room
     */
    get activity() {
        this.incrementProfilerCount('TowerClass.activity');

        let CombatHelper = require('helper.combat');
        let enemyIds = CombatHelper.getEnemyIdsByRoom(this.pos.roomName);

        if (enemyIds.length > 0) {
            return 'Attack';
        }

        return 'Repair';
    }

    /**
     * Do the given activity. This method connects the activity constant values
     * to the methods of the creep object
     */
    doActivityMethod(activity) {
        this.incrementProfilerCount('TowerClass.doActivityMethod');

        switch (activity) {
            case 'Attack':
                return this.doAttack();
            case 'Repair':
                return this.doRepair();
        }

        throw new Error(this.name + ' has no method for activity ' + activity);
    }

    doAttack() {
        this.incrementProfilerCount('TowerClass.doAttack');

        let CombatHelper = require('helper.combat');
        let enemyIds = CombatHelper.enemyIds;

        if (enemyIds.length == 0) {
            return true;
        }

        this.gameObject.attack(Game.getObjectById(enemyIds[0]));
    }

    doRepair() {
        this.incrementProfilerCount('TowerClass.doRepair');

        let RepairHelper = require('helper.repair');
        let weakestDamagedStructureId = RepairHelper.weakestDamagedStructureId;

        if (weakestDamagedStructureId) {
            let structure = Game.getObjectById(weakestDamagedStructureId);
            this.gameObject.repair(structure);
        }
    }

}

module.exports = TowerClass;
