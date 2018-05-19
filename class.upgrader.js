let SpenderClass = require('class.spender');

class UpgraderClass extends SpenderClass {

    /**
     * The body parts the simplest version of an upgrader should have
     */
    static get bodyBase() {
        return [MOVE, CARRY, MOVE, WORK];
    }

    static get bodyImprovement() {
        return [MOVE, CARRY, MOVE, WORK];
    }

    /**
     * Do the given activity. This method connects the activity constant values
     * to the methods of the creep object
     */
    doActivityMethod(activity) {
        switch (activity) {
            case 'Withdraw':
                return this.doWithdraw();
            case 'Work':
                return this.doUpgrade();
        }

        throw new Error(this.name + ' has no method for activity ' + activity);
    }

    /**
     * Upgrade the room's controller
     */
    doUpgrade() {
        let upgradeSite = Game.getObjectById(this.upgradeSiteId);

        if (!upgradeSite) {
            return false;
        }

        // If the upgrader is more than three spaces away from the site, it
        // needs to move to the site
        if (this.pos.getRangeTo(upgradeSite.pos) > 3) {
            this.goTo(upgradeSite.pos);
        }

        // If the upgrader is within three spaces of the controller, it can
        // upgrade it
        if (this.pos.getRangeTo(upgradeSite.pos) <= 3) {
            let upgradeResult = this.gameObject.upgradeController(upgradeSite);
        }

        // If the upgrader is now out of energy, clear the action site from cache
        if (this.carriedEnergy == 0) {
            this.clearCachedActionSiteId();
        }
    }

    /**
     * Computes whether a given site if valid for controller upgrade
     */
    isValidUpgradeSiteId(id) {
        let site = Game.getObjectById(id);

        return site instanceof StructureController;
    }

    /**
     * The minimum number of creeps of this role that should be in play
     */
    static get minimumCount() {
        return 1;
    }

    /**
     * The name of this creep's role
     */
    static get role() {
        return 'Upgrader';
    }

    static get spawnPriority() {
        return 90;
    }

    /**
     * Finds the closest room controller
     */
    get upgradeSiteId() {
        // First check to see if there's a location in the upgrader's cache
        let upgradeSiteId = this.cachedActionSiteId;

        if (this.isValidUpgradeSiteId(upgradeSiteId)) {
            return upgradeSiteId;
        }

        // Find all the structures in visible rooms
        let LocationHelper = require('helper.location');
        let siteIds = LocationHelper.findIds(FIND_STRUCTURES);

        // Filter out all the valid controllers
        let validSiteIds = [];

        for (let idxId in siteIds) {
            if (this.isValidUpgradeSiteId(siteIds[idxId])) {
                validSiteIds.push(siteIds[idxId]);
            }
        }

        // Find the closest among all the valid sites
        let closestValidSiteId = LocationHelper.findClosestId(this.pos, validSiteIds);

        // Save the closest valid site to the upgrader
        this.cacheActionSiteId(closestValidSiteId);


        return closestValidSiteId;
    }



}

module.exports = UpgraderClass;
