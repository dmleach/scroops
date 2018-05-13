let SpenderClass = require('class.spender');

class BuilderClass extends SpenderClass {

    /**
     * The body parts the simplest version of a builder should have
     */
    static get bodyBase() {
        return [MOVE, CARRY, MOVE, WORK];
    }

    static get bodyImprovement() {
        return [MOVE, CARRY, MOVE, WORK];
    }

    /**
     * Finds the construction site that is closest to being finished
     */
    get buildSiteId() {
        // First check to see if there's a location in the builder's cache
        let buildSiteId = this.cachedActionSiteId;

        if (this.isValidBuildSiteId(buildSiteId)) {
            return buildSiteId;
        }

        // Find all the construction sites in visible rooms
        let LocationHelper = require('helper.location');
        let siteIds = LocationHelper.findIds(FIND_MY_CONSTRUCTION_SITES);

        // Filter out all the valid controllers
        let validSiteIds = [];

        for (let idxId in siteIds) {
            if (this.isValidBuildSiteId(siteIds[idxId])) {
                validSiteIds.push(siteIds[idxId]);
            }
        }

        // Find the closest to being complete among all the valid sites
        let mostCompleteSiteId = false;
        let mostCompleteSiteDeficit = Infinity;

        for (let idxId in validSiteIds) {
            let site = Game.getObjectById(validSiteIds[idxId]);

            if (site.progressTotal - site.progress < mostCompleteSiteDeficit) {
                mostCompleteSiteId = validSiteIds[idxId];
                mostCompleteSiteDeficit = site.progressTotal - site.progress;
            }
        }

        // Save the closest valid site to the upgrader
        this.cacheActionSiteId(mostCompleteSiteId);

        return mostCompleteSiteId;
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
                return this.doWork();
        }

        throw new Error(this.name + ' has no method for activity ' + activity);
    }

    /**
     * Build the room's constructions
     */
    doBuild() {
        let buildSite = Game.getObjectById(this.buildSiteId);

        if (!buildSite) {
            return false;
        }

        // If the builder is more than three spaces away from the site, it
        // needs to move to the site
        if (this.pos.getRangeTo(buildSite.pos) > 3) {
            this.goTo(buildSite.pos);
        }

        // If the builder is within three spaces of the controller, it can
        // build it
        if (this.pos.getRangeTo(buildSite.pos) <= 3) {
            let buildResult = this.gameObject.build(buildSite);
        }

        // If the building is now complete, clear the action site from cache
        // and clear the location helper's structure cache
        if (buildSite.progress == buildSite.progressTotal) {
            this.clearCachedActionSiteId();
            let LocationHelper = require('helper.location');
            LocationHelper.clearCache([
                FIND_STRUCTURES, FIND_MY_STRUCTURES,
                FIND_CONSTRUCTION_SITES, FIND_MY_CONSTRUCTION_SITES
            ]);
        }

        // If the builder is now out of energy, clear the action site from cache
        if (this.carriedEnergy == 0) {
            this.clearCachedActionSiteId();
        }
    }

    doRepair() {
        let repairSite = Game.getObjectById(this.repairSiteId);

        if (!repairSite) {
            return false;
        }

        // If the builder is more than three spaces away from the site, it
        // needs to move to the site
        if (this.pos.getRangeTo(repairSite.pos) > 3) {
            this.goTo(repairSite.pos);
        }

        // If the builder is within three spaces of the controller, it can
        // repair it
        if (this.pos.getRangeTo(repairSite.pos) <= 3) {
            let repairResult = this.gameObject.repair(repairSite);
        }
    }

    doWork() {
        let LocationHelper = require('helper.location');
        let constructionSiteIds = LocationHelper.findIds(FIND_MY_CONSTRUCTION_SITES);

        if (constructionSiteIds.length > 0) {
            this.doBuild();
        } else {
            this.doRepair();
        }
    }

    /**
     * Computes whether a given site is valid for building
     */
    isValidBuildSiteId(id) {
        let site = Game.getObjectById(id);

        return (site instanceof ConstructionSite && site.my);
    }

    /**
     * The minimum number of creeps of this role that should be in play
     */
    static get minimumCount() {
        return 1;
    }

    get repairSiteId() {
        return '5af14a821ad10d5415ba77a6';
    }

    /**
     * The name of this creep's role
     */
    static get role() {
        return 'Builder';
    }

}

module.exports = BuilderClass;
