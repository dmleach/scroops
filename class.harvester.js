let CreepClass = require('class.creep');

const ACTIVITY_HARVEST = 0;
const ACTIVITY_DEPOSIT = 1;

class HarvesterClass extends CreepClass {

    /**
     * Computes the activity the creep should perform this turn
     */
    get activity () {
        let Profiler = require('helper.profiler');
        Profiler.increment('HarvesterClass.activity');

        // If the harvester has room to carry one more harvest worth of energy,
        // it should harvest
        if (this.carriedEnergy + this.energyPerHarvest <= this.gameObject.carryCapacity) {
            return ACTIVITY_HARVEST;
        }

        // Otherwise the harvester should deposit the energy it's carrying
        return ACTIVITY_DEPOSIT;
    }

    static assignHarvestSite(roomName) {
        let Profiler = require('helper.profiler');
        Profiler.increment('HarvesterClass.assignHarvestSite');

        // Find all the sources in the given room
        let LocationHelper = require('helper.location');
        let sourceIds = LocationHelper.findIds(FIND_SOURCES, roomName);
        let CreepHelper = require('helper.creep');

        for (let idxSourceId in sourceIds) {
            // There shouldn't be more than six WORK parts on harvesters
            // assigned to this source
            let workPartCount = 0;
            let sourceHarvesterIds = this.getHarvesterIdsBySourceId(sourceIds[idxSourceId]);

            for (let idxHarvesterId in sourceHarvesterIds) {
                let creep = CreepHelper.createCreepById(sourceHarvesterIds[idxHarvesterId]);

                if (creep) {
                    workPartCount += creep.getBodyPartCount(WORK);
                }
            }

            // There shouldn't be more creeps assigned to this source than
            // walkable spaces around it
            let walkableSpaces = 0;
            let source = Game.getObjectById(sourceIds[idxSourceId]);

            if (source) {
                walkableSpaces = LocationHelper.getWalkableSpacesAroundCount(source.pos);
            }

            if (workPartCount < 6 && sourceHarvesterIds.length < walkableSpaces) {
                return sourceIds[idxSourceId];
            }
        }

        return undefined;
    }

    /**
     * The body parts the most simplest version of a harvester should have
     */
    static get bodyBase() {
        let Profiler = require('helper.profiler');
        Profiler.increment('HarvesterClass.bodyBase');

        return [MOVE, CARRY, WORK];
    }

    static get bodyImprovement() {
        let Profiler = require('helper.profiler');
        Profiler.increment('HarvesterClass.bodyImprovement');

        return [WORK];
    }

    static get bodyMaximum() {
        let Profiler = require('helper.profiler');
        Profiler.increment('HarvesterClass.bodyMaximum');

        return [MOVE, CARRY, WORK, WORK, WORK, WORK, WORK, WORK];
    }

    get depositSiteId () {
        let Profiler = require('helper.profiler');
        Profiler.increment('HarvesterClass.depositSiteId');

        // Find the closest container, if one exists
        let LocationHelper = require('helper.location');
        let structureIds = LocationHelper.findIds(FIND_STRUCTURES);
        let containerIds = [];

        for (let idxId in structureIds) {
            let gameObject = Game.getObjectById(structureIds[idxId]);

            if (gameObject instanceof StructureContainer) {
                if (gameObject.store [RESOURCE_ENERGY] < gameObject.storeCapacity) {
                    containerIds.push(structureIds[idxId]);
                }
            }
        }

        if (containerIds.length == 0) {
            return false;
        }

        return LocationHelper.findClosestId(this.pos, containerIds);
    }

    /**
     * Do the given activity. This method connects the activity constant values
     * to methods of the creep object
     */
    doActivityMethod(activity) {
        let Profiler = require('helper.profiler');
        Profiler.increment('HarvesterClass.doActivityMethod');

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
        let Profiler = require('helper.profiler');
        Profiler.increment('HarvesterClass.doDeposit');

        let depositSiteId = this.depositSiteId;

        if (!depositSiteId) {
            this.gameObject.drop(RESOURCE_ENERGY);
            return;
        }

        let depositSite = Game.getObjectById(depositSiteId);

        if (!depositSite) {
            this.gameObject.drop(RESOURCE_ENERGY);
            return;
        }

        if (this.pos.getRangeTo(depositSite.pos) > 1) {
            this.gameObject.drop(RESOURCE_ENERGY);
            return;
        }

        this.gameObject.transfer(depositSite, RESOURCE_ENERGY);
    }

    /**
     * Harvest energy from a source
     */
    doHarvest() {
        let Profiler = require('helper.profiler');
        Profiler.increment('HarvesterClass.doHarvest');

        let harvestSite = Game.getObjectById(this.harvestSiteId);

        if (!harvestSite) {
            return false;
        }

        // If the harvester is more than one space away from the source, it
        // needs to move to the source
        if (this.pos.getRangeTo(harvestSite.pos) > 1) {
            this.goTo(harvestSite.pos);
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
        let Profiler = require('helper.profiler');
        Profiler.increment('HarvesterClass.energyPerHarvest');

        // Each of the harvester's WORK body parts will harvest 2 energy
        return this.getBodyPartCount(WORK) * 2;
    }

    static getHarvesterIdsBySourceId(sourceId) {
        let Profiler = require('helper.profiler');
        Profiler.increment('HarvesterClass.getHarvesterIdsBySourceId');

        let resultIds = [];
        let CreepHelper = require('helper.creep');
        let harvesterIds = CreepHelper.getCreepIdsByRole(this.role);

        for (let idxId in harvesterIds) {
            let harvester = CreepHelper.createCreepById(harvesterIds[idxId]);

            if (harvester) {
                if (harvester.cachedActionSiteId == sourceId) {
                    resultIds.push(harvesterIds[idxId]);
                }
            }
        }


        return resultIds;
    }

    static getShouldSpawn(roomName) {
        let Profiler = require('helper.profiler');
        Profiler.increment('HarvesterClass.getShouldSpawn');

        if (super.getShouldSpawn(roomName)) {
            return true;
        }

        // Harvesters only work in friendly rooms
        let RoomHelper = require('helper.room');

        if (RoomHelper.isFriendly(roomName) == false) {
            return false;
        }

        let harvestSiteId = this.assignHarvestSite(roomName);
        return harvestSiteId !== undefined;
    }

    /**
     * Finds the closest source with energy to the harvester
     */
    get harvestSiteId() {
        let Profiler = require('helper.profiler');
        Profiler.increment('HarvesterClass.harvestSiteId');

        // First check to see if there's a source in the harvester's cache
        if (this.cachedActionSiteId) {
            return this.cachedActionSiteId;
        }

        // If not, assign a source to this harvester
        let harvestSiteId = HarvesterClass.assignHarvestSite(this.roomName);

        if (harvestSiteId) {
            this.cacheActionSiteId(harvestSiteId);
            return harvestSiteId;
        }

        return undefined;
    }

    /**
     * Computes whether a given harvest site is valid for harvesting
     */
    isValidHarvestSiteId(id) {
        let Profiler = require('helper.profiler');
        Profiler.increment('HarvesterClass.isValidHarvestSiteId');

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
        let Profiler = require('helper.profiler');
        Profiler.increment('HarvesterClass.minimumCount');

        return 1;
    }

    /**
     * The name of this creep's role
     */
    static get role() {
        let Profiler = require('helper.profiler');
        Profiler.increment('HarvesterClass.role');

        return 'Harvester';
    }

    static get spawnPriority() {
        let Profiler = require('helper.profiler');
        Profiler.increment('HarvesterClass.spawnPriority');

        return 100;
    }

}

module.exports = HarvesterClass;
