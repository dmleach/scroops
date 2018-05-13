/**
 * Spenders are creeps that take energy harvested or dropped by other creeps
 * and use it to do work. Examples are creeps that build constructions or
 * upgrade controller
 */

let CreepClass = require('class.creep');

class SpenderClass extends CreepClass {

    /**
     * Computes the activity the creep should perform this turn
     */
    get activity () {
        // If the creep has no energy, it should go find some
        if (this.carriedEnergy == 0) {
            return 'Withdraw';
        }

        // Otherwise the creep should do whatever work its role handles
        return 'Work';
    }

    /**
     * Withdraw energy from nearby containers and resources
     */
    doWithdraw() {
        let withdrawSite = Game.getObjectById(this.withdrawSiteId);

        if (!withdrawSite) {
            return false;
        }

        // If the creep is more than one space away from the site, it
        // needs to move to the site
        if (this.pos.getRangeTo(withdrawSite.pos) > 1) {
            this.goTo(withdrawSite.pos);
        }

        // If the creep is exactly one space away from the site, it can
        // withdraw energy from the site
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
        if (withdrawResult === OK) {
            this.clearCachedActionSiteId();
        }
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
        let energyIds = LocationHelper.findIds(FIND_DROPPED_RESOURCES);

        for (let idxId in energyIds) {
            validSiteIds.push(energyIds[idxId]);
        }

        if (validSiteIds.length == 0) {
            return false;
        }

        // Find the closest among all the valid sites
        let closestValidSiteId = LocationHelper.findClosestId(this.pos, validSiteIds);

        // Save the closest valid site to the upgrader
        this.cacheActionSiteId(closestValidSiteId);

        return closestValidSiteId;
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

}

module.exports = SpenderClass;
