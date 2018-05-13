let CreepClass = require('class.creep');

class DistributorClass extends CreepClass {

    /**
     * Computes the activity the creep should perform this turn
     */
    get activity () {
        // If the distributor has energy, it should deposit it
        if (this.carriedEnergy > 0)  {
            return 'Deposit';
        }

        // Otherwise the distributor should withdraw more energy
        return 'Withdraw';
    }

    static get bodyBase() {
        return [MOVE, CARRY];
    }

    static get bodyImprovement() {
        return [MOVE, CARRY];
    }

    get depositSiteId() {
        // First check to see if there's a location in the distributor's cache
        let depositSiteId = this.cachedActionSiteId;

        if (this.isValidDepositSiteId(depositSiteId)) {
            return depositSiteId;
        }

        // Find all the structures in visible rooms
        let LocationHelper = require('helper.location');
        let siteIds = LocationHelper.findIds(FIND_STRUCTURES);

        // Filter out all the valid sites
        let validSiteIds = [];

        for (let idxId in siteIds) {
            if (this.isValidDepositSiteId(siteIds[idxId])) {
                validSiteIds.push(siteIds[idxId]);
            }
        }

        if (validSiteIds.length == 0) {
            return false;
        }

        // Find the emptyest among all the valid sites
        let EnergyHelper = require('helper.energy');
        let emptyestSiteId = EnergyHelper.emptyestSiteByIds(validSiteIds, this.pos);

        // Save the closest valid site to the upgrader
        this.cacheActionSiteId(emptyestSiteId);

        return emptyestSiteId;
    }

    /**
     * Do the given activity. This method connects the activity constant values
     * to the methods of the creep object
     */
    doActivityMethod(activity) {
        switch (activity) {
            case 'Withdraw':
                return this.doWithdraw();
            case 'Deposit':
                return this.doDeposit();
        }

        throw new Error(this.name + ' has no method for activity ' + activity);
    }

    doDeposit() {
        let depositSiteId = this.depositSiteId;

        if (!depositSiteId) {
            console.log(this.name + ' deposit site id is invalid');
            return false;
        }

        let depositSite = Game.getObjectById(depositSiteId);

        if (!depositSite) {
            console.log(this.name + ' deposit site is invalid');
            return false;
        }

        // If the creep is more than one space away from the site, it
        // needs to move to the site
        if (this.pos.getRangeTo(depositSite.pos) > 1) {
            this.goTo(depositSite.pos);
        }

        // If the creep is exactly one space away from the site, it can
        // deposit energy into the site
        let transferResult = false;

        if (this.pos.getRangeTo(depositSite.pos) == 1) {
            transferResult = this.gameObject.transfer(depositSite, RESOURCE_ENERGY);
        }

        // If the withdrawal was successful, clear the action site from cache
        if (transferResult === OK) {
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

    isValidDepositSiteId(id) {
        let site = Game.getObjectById(id);

        if (site instanceof StructureContainer) {
            return site.store[RESOURCE_ENERGY] < site.storeCapacity;
        }

        if (site instanceof StructureExtension || site instanceof StructureSpawn || site instanceof StructureTower) {
            return site.energy < site.energyCapacity;
        }

        return false;
    }

    /**
     * Finds the most full container or resource with energy
     */
    get withdrawSiteId() {
        // First check to see if there's a location in the distributor's cache
        let EnergyHelper = require('helper.energy');
        let withdrawSiteId = this.cachedActionSiteId;

        if (EnergyHelper.isValidWithdrawSiteId(withdrawSiteId)) {
            return withdrawSiteId;
        }

        // If not, find the valid withdraw sites in the room
        let validSiteIds = EnergyHelper.validWithdrawSiteIdsByRoom(this.pos.roomName);

        if (validSiteIds.length == 0) {
            return false;
        }

        // Find the fullest among all the valid sites
        let fullestSiteId = EnergyHelper.fullestSiteByIds(validSiteIds, this.pos);

        // Save the closest valid site to the upgrader
        this.cacheActionSiteId(fullestSiteId);

        return fullestSiteId;
    }

    static get minimumCount() {
        return 2;
    }

    static get role() {
        return 'Distributor';
    }

}

module.exports = DistributorClass;
