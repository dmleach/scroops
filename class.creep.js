var ActiveClass = require('class.active');

class CreepClass extends ActiveClass {

    /**
     * Returns an array of body parts on the creep
     */
    get body() {
        this.incrementProfilerCount('CreepClass.body');

        let body = [];

        for (let idxBody in this.gameObject.body) {
            body.push(this.gameObject.body[idxBody].type);
        }

        return body;
    }

    static get bodyBase() {
        this.incrementProfilerCount('CreepClass.bodyBase');

        throw new Error('bodyBase method has not been defined for ' + this.name);
    }

    static get bodyImprovement() {
        this.incrementProfilerCount('CreepClass.bodyImprovement');

        throw new Error('bodyImprovement method has not been defined for ' + this.name);
    }

    static get bodyMaximum() {
        this.incrementProfilerCount('CreepClass.bodyMaximum');

        return [
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
            CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
            WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
        ];
    }

    static bodyByEnergy(energy) {
        this.incrementProfilerCount('CreepClass.bodyByEnergy');

        let CreepHelper = require('helper.creep');
        let body = this.bodyBase;

        if (CreepHelper.bodyCost(body) > energy) {
            return false;
        }

        let cost = Infinity;
        let isOverMaximum = true;

        try {
            do {
                cost = CreepHelper.bodyCost(body.concat(this.bodyImprovement));
                isOverMaximum = this.isBodyMoreDeveloped(body.concat(this.bodyImprovement), this.bodyMaximum);

                if ( (cost <= energy) && (isOverMaximum == false) ) {
                    body = body.concat(this.bodyImprovement);
                }
            } while (cost <= energy && isOverMaximum == false);
        } catch (Error) {
            // Most likely error is that bodyImprovement wasn't defined, and
            // that's acceptable. It'd be better to define a specific error
            // class to know for sure
        }

        return body;
    }

    cacheActionPosition(pos) {
        this.incrementProfilerCount('CreepClass.cacheActionPosition');

        this.writeToCache('creeps.' + this.name + '.actionPosition', pos);
    }

    cacheActionSiteId(id) {
        this.incrementProfilerCount('CreepClass.cacheActionSiteId');

        this.writeToCache('creeps.' + this.name + '.actionSiteId', id);
    }

    get cachedActionPosition() {
        this.incrementProfilerCount('CreepClass.cachedActionPosition');

        return this.readFromCache('creeps.' + this.name + '.actionPosition');
    }

    get cachedActionSiteId() {
        this.incrementProfilerCount('CreepClass.cachedActionSiteId');

        return this.readFromCache('creeps.' + this.name + '.actionSiteId');
    }

    get carriedEnergy() {
        this.incrementProfilerCount('CreepClass.carriedEnergy');

        return this.gameObject.carry [RESOURCE_ENERGY];
    }

    get carryCapacity() {
        this.incrementProfilerCount('CreepClass.carryCapacity');

        return this.gameObject.carryCapacity;
    }

    clearCachedActionSiteId() {
        this.incrementProfilerCount('CreepClass.clearCachedActionSiteId');

        this.cacheActionSiteId(undefined);
    }

    /**
     * Returns the current number of creeps with this creep's role
     */
    static get count() {
        this.incrementProfilerCount('CreepClass.count');

        let CreepHelper = require('helper.creep');
        let count = 0;

        for (let creepName in Game.creeps) {
            // A creep's role is defined by the non-numeric part of its name.
            // A creep whose name contains "Harvester" is a Harvester
            if (CreepHelper.getRoleByName(creepName) == this.role) {
                count++;
            }
        }

        return count;
    }

    getBodyPartCount(bodyPart) {
        this.incrementProfilerCount('CreepClass.getBodyPartCount');

        return CreepClass.getPartCountByBody(bodyPart, this.body);
    }

    static getPartCountByBody(part, body) {
        this.incrementProfilerCount('CreepClass.getPartCountByBody');

        let count = 0;

        for (let idxBody in body) {
            if (body[idxBody] == part) {
                count++;
            }
        }

        return count;
    }

    static getShouldSpawn(roomName) {
        this.incrementProfilerCount('CreepClass.getShouldSpawn');

        if (this.count < this.minimumCount) {
            return true;
        }

        return false;
    }

    goTo(destinationPos) {
        this.incrementProfilerCount('CreepClass.goTo');

        if (this.pos.isEqualTo(destinationPos)) {
            return true;
        }

        let PathHelper = require('helper.path');
        let path = PathHelper.find(this.pos, destinationPos);
        let resultPosition = PathHelper.getPosByDirection(this.pos, path.direction);

        if (!PathHelper.isSpaceOpen(resultPosition)) {
            PathHelper.moveBlockingCreeps(resultPosition, path.direction);
        }

        let moveResult = undefined;

        if (PathHelper.isSpaceOpen(resultPosition)) {
            moveResult = this.gameObject.move(path.direction);
        } else {
            moveResult = this.gameObject.moveTo(destinationPos);
        }
    }

    static isBodyMoreDeveloped(testBody, referenceBody) {
        this.incrementProfilerCount('CreepClass.isBodyMoreDeveloped');

        let uniqueParts = Array.from(new Set(testBody));

        for (let idxUniquePart in uniqueParts) {
            let part = uniqueParts[idxUniquePart];
            let testCount = this.getPartCountByBody(part, testBody);
            let referenceCount = this.getPartCountByBody(part, referenceBody)

            if (testCount > referenceCount) {
                return true;
            }
        }

        return false;
    }

    isSiblingByName(creepName) {
        this.incrementProfilerCount('CreepClass.isSiblingByName');

        if (creepName == this.name) {
            return false;
        }

        let creep = Game.creeps[creepName];

        if (!creep) {
            return false
        }

        let CreepHelper = require('helper.creep');
        return this.role == CreepHelper.getCreepClassByName(creepName).role;
    }

    static get minimumCount() {
        this.incrementProfilerCount('CreepClass.minimumCount');

        return 0;
    }

    static get role() {
        this.incrementProfilerCount('CreepClass.role (static)');

        throw new Error('The base creep class does not have a role');
    }

    get role() {
        this.incrementProfilerCount('CreepClass.role');

        return this.constructor.role;
    }

    get siblingIds() {
        this.incrementProfilerCount('CreepClass.siblingIds');

        let siblings = [];

        for (let creepName in Game.creeps) {
            if (this.isSiblingByName(creepName)) {
                siblings.push(Game.creeps[creepName].id);
            }
        }

        return siblings;
    }

    static get spawnPriority() {
        this.incrementProfilerCount('CreepClass.spawnPriority');

        return 0;
    }

}

module.exports = CreepClass;
