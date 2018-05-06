let CreepClass = require('class.creep');

const ACTIVITY_HARVEST = 0;
const ACTIVITY_DEPOSIT = 1;

class HarvesterClass extends CreepClass {

    get activity () {
        if (this.carriedEnergy + this.energyPerHarvest <= this.gameObject.carryCapacity) {
            return ACTIVITY_HARVEST;
        }

        return ACTIVITY_DEPOSIT;
    }

    static get bodyBase() {
        return [MOVE, CARRY, WORK];
    }

    doActivityMethod(activity) {
        switch (activity) {
            case ACTIVITY_HARVEST:
                return this.doHarvest();
            case ACTIVITY_DEPOSIT:
                return this.doDeposit();
        }

        throw new Error(this.name + ' has no method for activity ' + activity);
    }

    doHarvest() {
        console.log(this.name + ' is harvesting');
        let actionSite = this.harvestSite;
    }

    get energyPerHarvest() {
        let body = this.body;
        let workCount = 0;

        for (let idxBody in body) {
            if (body[idxBody] == WORK) {
                workCount++;
            }
        }

        return workCount * 2;
    }

    get harvestSite() {
        let harvestSite = this.cachedActionSite;

        if (this.isValidHarvestSite(harvestSite)) {
            return harvestSite;
        }

        let LocationHelper = require('helper.location');
        let sources = LocationHelper.find(FIND_SOURCES);

        for (let idxSource in sources) {
            console.log(sources[idxSource]);
        }
    }

    isValidHarvestSite(site) {
        if (site instanceof Source) {
            return site.energy > 0;
        }

        return false;
    }

    static get minimumCount() {
        return 1;
    }

    static get role() {
        return 'Harvester';
    }

}

module.exports = HarvesterClass;
