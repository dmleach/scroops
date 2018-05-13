class EnergyHelper {

    static emptyestSiteByIds(siteIds, position = undefined) {
        let emptyestSiteId = false;
        let emptyestSiteEnergy = Infinity;
        let emptyestSiteEnergyDistance = Infinity;

        for (let idxId in siteIds) {
            let siteEnergy = this.energyBySiteId(siteIds[idxId]);

            if (position && (siteEnergy == emptyestSiteEnergy)) {
                let siteEnergyDistance = position.getRangeTo(Game.getObjectById(siteIds[idxId]).pos);

                if (siteEnergyDistance < emptyestSiteEnergyDistance) {
                    emptyestSiteId = siteIds[idxId];
                    emptyestSiteEnergyDistance = siteEnergyDistance;
                }

            }

            if (siteEnergy < emptyestSiteEnergy) {
                emptyestSiteId = siteIds[idxId];
                emptyestSiteEnergy = siteEnergy;

                if (position) {
                    emptyestSiteEnergyDistance = position.getRangeTo(Game.getObjectById(emptyestSiteId).pos);
                }
            }
        }

        return emptyestSiteId;
    }

    /**
     * Returns the amount of energy stored in the site with the given id
     */
    static energyBySiteId(siteId) {
        let site = Game.getObjectById(siteId);

        if (!site) {
            return false;
        }

        if (site instanceof StructureContainer) {
            return site.store [RESOURCE_ENERGY];
        }

        if (site instanceof Resource) {
            return site.amount;
        }

        return site.energy;
    }

    static fullestSiteByIds(siteIds, position = undefined) {
        let fullestSiteId = false;
        let fullestSiteEnergy = 0;
        let fullestSiteEnergyDistance = Infinity;

        for (let idxId in siteIds) {
            let siteEnergy = this.energyBySiteId(siteIds[idxId]);

            if (position && (siteEnergy == fullestSiteEnergy)) {
                let siteEnergyDistance = position.getRangeTo(Game.getObjectById(siteIds[idxId]).pos);

                if (siteEnergyDistance < fullestSiteEnergyDistance) {
                    fullestSiteId = siteIds[idxId];
                    fullestSiteEnergyDistance = siteEnergyDistance;
                }

            }

            if (siteEnergy > fullestSiteEnergy) {
                fullestSiteId = siteIds[idxId];
                fullestSiteEnergy = siteEnergy;

                if (position) {
                    fullestSiteEnergyDistance = position.getRangeTo(Game.getObjectById(fullestSiteId).pos);
                }
            }
        }

        return fullestSiteId;
    }

    /**
     * Computes whether a given site is valid for energy withdrawal
     */
    static isValidWithdrawSiteId(id) {
        let site = Game.getObjectById(id);

        if (site instanceof StructureContainer) {
            return site.store [RESOURCE_ENERGY];
        }

        if (site instanceof Resource) {
            return true;
        }

        return false;
    }

    /**
     * Returns an array of the ids of all the valid sites for energy withdrawal
     * in the given room
     */
    static validWithdrawSiteIdsByRoom(roomName) {
        // Find all the structures in the given room
        let LocationHelper = require('helper.location');
        let siteIds = LocationHelper.findIds(FIND_STRUCTURES, roomName);

        // Filter out all the valid sites
        let validSiteIds = [];

        for (let idxId in siteIds) {
            if (this.isValidWithdrawSiteId(siteIds[idxId])) {
                validSiteIds.push(siteIds[idxId]);
            }
        }

        // Also find all dropped energy resources in visible rooms
        let energyIds = LocationHelper.findIds(FIND_DROPPED_RESOURCES, [roomName]);

        for (let idxId in energyIds) {
            validSiteIds.push(energyIds[idxId]);
        }

        return validSiteIds;
    }

    /**
     * Computes the total amount of energy valid for withdrawal in the given room
     */
    static withdrawableEnergyByRoom(roomName) {
        let room = Game.rooms[roomName];

        if (!room) {
            throw new Error('Cannot see room ' + roomName);
        }

        let energyTotal = 0;
    }

}

module.exports = EnergyHelper;
