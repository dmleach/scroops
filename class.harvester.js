let CreepClass = require('class.creep');

const ACTIVITY_HARVEST = 0;
const ACTIVITY_DEPOSIT = 1;

class HarvesterClass extends CreepClass {

    /**
     * Computes the activity the creep should perform this turn
     */
    get activity () {
        // If the harvester has room to carry one more harvest worth of energy,
        // it should harvest
        if (this.carriedEnergy + this.energyPerHarvest <= this.gameObject.carryCapacity) {
            return ACTIVITY_HARVEST;
        }

        // Otherwise the harvester should deposit the energy it's carrying
        return ACTIVITY_DEPOSIT;
    }

    /**
     * The body parts the most simplest version of a harvester should have
     */
    static get bodyBase() {
        return [MOVE, CARRY, WORK];
    }

    /**
     * Do the given activity. This method connects the activity constant values
     * to methods of the creep object
     */
    doActivityMethod(activity) {
        switch (activity) {
            case ACTIVITY_HARVEST:
                return this.doHarvest();
            case ACTIVITY_DEPOSIT:
                return this.doDeposit();
        }

        throw new Error(this.name + ' has no method for activity ' + activity);
    }

    /**
     * Deposit carried energy
     */
    doDeposit() {
        this.gameObject.drop(RESOURCE_ENERGY);
    }

    /**
     * Harvest energy from a source
     */
    doHarvest() {
        let harvestSite = Game.getObjectById(this.harvestSiteId);

        if (!harvestSite) {
            return false;
        }

        // If the harvester is more than one space away from the source, it
        // needs to move to the source
        if (this.pos.getRangeTo(harvestSite.pos) > 1) {
            let PathHelper = require('helper.path');
            this.moveByPath(PathHelper.find(this.pos, harvestSite.pos));
        }

        // If the harvester is exactly one space away from the source, it can
        // harvest energy from the source
        if (this.pos.getRangeTo(harvestSite.pos) == 1) {
            let harvestResult = this.gameObject.harvest(harvestSite);
        }
    }

    /**
     * Computes the amount of energy the harvester will gain from each harvest
     */
    get energyPerHarvest() {
        let body = this.body;
        let workCount = 0;

        for (let idxBody in body) {
            if (body[idxBody] == WORK) {
                workCount++;
            }
        }

        // Each of the harvester's WORK body parts will harvest 2 energy
        return workCount * 2;
    }

    /**
     * Finds the closest source with energy to the harvester
     */
    get harvestSiteId() {
        // First check to see if there's a source in the harvester's cache
        let harvestSiteId = this.cachedActionSiteId;

        if (this.isValidHarvestSiteId(harvestSiteId)) {
            return harvestSiteId;
        }

        // Find all the sources in visible rooms
        let LocationHelper = require('helper.location');
        let sourceIds = LocationHelper.findIds(FIND_SOURCES);

        // Find the closest source among all the found sources
        let closestSourceId = LocationHelper.findClosestId(this.pos, sourceIds);

        // Save the closest source to the harvester's cache
        this.cacheActionSiteId(closestSourceId);

        return closestSourceId;
    }

    /**
     * Computes whether a given harvest site is valid for harvesting
     */
    isValidHarvestSiteId(id) {
        let site = Game.getObjectById(id);

        if (site instanceof Source) {
            // Sources should have energy
            return site.energy > 0;
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
        return 'Harvester';
    }

    static get shouldSpawn() {
        if (super.shouldSpawn) {
            return true;
        }

        // At most, there should be one harvester for every empty space around
        // the friendly rooms' sources
        let emptySpaces = 0;
        let LocationHelper = require('helper.location');
        let sourceIds = LocationHelper.findIds(FIND_SOURCES);

        for (let idxId in sourceIds) {
            let source = Game.getObjectById(sourceIds[idxId]);

            if (source) {
                if (source.room.controller) {
                    if (source.room.controller.my) {
                        emptySpaces += LocationHelper.getOpenSpacesAroundCount(source.pos);
                    }
                }
            }
        }

        return emptySpaces > 0;
    }

}

module.exports = HarvesterClass;
