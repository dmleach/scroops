let CreepClass = require('class.creep');

const ACTIVITY_WITHDRAW = 0;
const ACTIVITY_UPGRADE = 1;

class UpgraderClass extends CreepClass {

    /**
     * Computes the activity the creep should perform this turn
     */
    get activity () {
        // If the upgrader has no energy, it should go find some
        if (this.carriedEnergy == 0) {
            return ACTIVITY_WITHDRAW;
        }

        // Otherwise the upgrader should upgrader the room's controller
        return ACTIVITY_UPGRADE;
    }

    /**
     * The body parts the simplest version of an upgrader should have
     */
    static get bodyBase() {
        return [MOVE, CARRY, MOVE, WORK];
    }

    /**
     * Do the given activity. This method connects the activity constant values
     * to the methods of the creep object
     */
    doActivityMethod(activity) {
        switch (activity) {
            case ACTIVITY_WITHDRAW:
                return this.doWithdraw();
            case ACTIVITY_UPGRADE:
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
            let PathHelper = require('helper.path');
            this.moveByPath(PathHelper.find(this.pos, upgradeSite.pos));
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
     * Withdraw energy from nearby containers and resources
     */
    doWithdraw() {
        let withdrawSite = Game.getObjectById(this.withdrawSiteId);

        if (!withdrawSite) {
            return false;
        }

        // If the upgrader is more than one space away from the site, it
        // needs to move to the site
        if (this.pos.getRangeTo(withdrawSite.pos) > 1) {
            let PathHelper = require('helper.path');
            this.moveByPath(PathHelper.find(this.pos, withdrawSite.pos));
        }

        // If the upgrader is exactly one space away from the source, it can
        // withdraw energy from the source
        let withdrawResult = false;

        if (this.pos.getRangeTo(withdrawSite.pos) == 1) {
            if (withdrawSite instanceof Resource) {
                withdrawResult = this.gameObject.pickup(withdrawSite);
            }

            if (withdrawSite instanceof StructureContainer) {
                withdrawResult = this.gameObject.withdraw(withdrawSite, RESOURCE_ENERGY);
            }
        }

        // If the withdrawal was successful, clear the action site from cache
        if (withdrawResult == OK) {
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
     * Computes whether a given site is valid for energy withdrawal
     */
    isValidWithdrawSiteId(id) {
        let site = Game.getObjectById(id);

        if (site instanceof StructureContainer) {
            return site.store [RESOURCE_ENERGY] > 0;
        }

        if (site instanceof Resource) {
            return true;
        }

        return false;
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

    /**
     * Finds the closest container or resource with energy
     */
    get withdrawSiteId() {
        // First check to see if there's a location in the upgrader's cache
        let withdrawSiteId = this.cachedActionSiteId;

        if (this.isValidWithdrawSiteId(withdrawSiteId)) {
            return withdrawSiteId;
        }

        // Find all the structures in visible rooms
        let LocationHelper = require('helper.location');
        let siteIds = LocationHelper.findIds(FIND_STRUCTURES);

        // Filter out all the valid sites
        let validSiteIds = [];

        for (let idxId in siteIds) {
            if (this.isValidWithdrawSiteId(siteIds[idxId])) {
                validSiteIds.push(siteIds[idxId]);
            }
        }

        // Also find all dropped energy resources in visible rooms
        validSiteIds.push(LocationHelper.findIds(FIND_DROPPED_RESOURCES));

        if (validSiteIds.length == 0) {
            return false;
        }

        // Find the closest among all the valid sites
        let closestValidSiteId = LocationHelper.findClosestId(this.pos, validSiteIds);

        // Save the closest valid site to the upgrader
        this.cacheActionSiteId(closestValidSiteId);

        return closestValidSiteId;
    }

}

module.exports = UpgraderClass;
