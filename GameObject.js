class GameObject
{
    constructor(id) {
        if (id === undefined) {
            console.log('[ERROR] GameObject constructor requires an id');
            return;
        }

        this.gameObject = Game.getObjectById(id);
    }

    debug(message) {
        if (this.isShowingDebugMessages === false) {
            return;
        }

        console.log('[DEBUG] ' + this.name + ': ' + message);
    }

    directionName(direction) {
        let directionNames = {};
        directionNames[TOP_LEFT] = 'top left';
        directionNames[TOP] = 'top';
        directionNames[TOP_RIGHT] = 'top right';
        directionNames[LEFT] = 'left';
        directionNames[RIGHT] = 'right';
        directionNames[BOTTOM_LEFT] = 'bottom left';
        directionNames[BOTTOM] = 'bottom';
        directionNames[BOTTOM_RIGHT] = 'bottom right';

        return (direction in directionNames) ? directionNames[direction] : 'unknown';
    }

    get energy() {
        if ('store' in this.gameObject) {
            return this.gameObject.store.getUsedCapacity(RESOURCE_ENERGY);
        }

        return undefined;
    }

    error(errorCode, message = '') {
        if (this.isShowingErrorMessages === false) {
            return;
        }

        let UtilErrorClass = require('UtilError');
        message = '[ERROR ' + errorCode + ': ' + UtilErrorClass.getMessageFromCode(errorCode)  + '] ' + this.name + ': ' + message;

        console.log(message.replace(/:$/, ''));
    }

    get full() {
        if ('store' in this.gameObject) {
            return this.gameObject.store.getFreeCapacity(RESOURCE_ENERGY) === 0;
        }

        return undefined;
    }

    getRange(position) {
        return position.getRangeTo(this.pos);
    }

    get id() {
        return this.gameObject.id;
    }

    get isShowingDebugMessages() {
        return false;
    }

    get isShowingErrorMessages() {
        return true;
    }

    get isShowingWarningMessages() {
        return true;
    }

    get name() {
        if (this.gameObject === undefined) {
            return 'Undefined object';
        } else if (this.gameObject === null) {
            return 'Null object';
        }

        if ('name' in this.gameObject) {
            return this.gameObject.name;
        } else if ('structureType' in this.gameObject) {
            return this.gameObject.structureType + ' at ' + this.pos;
        } else if ('type' in this.gameObject) {
            return this.gameObject.type + ' at ' + this.pos;
        // }

        // if (this.gameObject instanceof ConstructionSite) {
        //     return 'Construction site at ' + this.pos;
        // } else if (this.gameObject instanceof Deposit) {
        //     return 'Deposit at ' + this.pos;
        // } else if (this.gameObject instanceof Flag) {
        //     return 'Flag at ' + this.pos;
        // } else if (this.gameObject instanceof Mineral) {
        //     return 'Mineral at ' + this.pos;
        // } else if (this.gameObject instanceof Nuke) {
        //     return 'Nuke target at ' + this.pos;
        // } else if (this.gameObject instanceof PowerCreep) {
        //     return this.gameObject.name + ' (power)';
        // } else if (this.gameObject instanceof Resource) {
        //     return 'Dropped resource at ' + this.pos;
        // } else if (this.gameObject instanceof Ruin) {
        //     return 'Ruin at ' + this.pos;
        } else if (this.gameObject instanceof Source) {
            return 'Source at ' + this.pos;
        // } else if (this.gameObject instanceof StructureContainer) {
        //     return 'Container at ' + this.pos;
        // } else if (this.gameObject instanceof StructureController) {
        //     return 'Controller of room ' + this.roomName;
        // } else if (this.gameObject instanceof StructureExtension) {
        //     return 'Extension at ' + this.pos;
        // } else if (this.gameObject instanceof StructureExtractor) {
        //     return 'Extractor at ' + this.pos;
        // } else if (this.gameObject instanceof StructureFactory) {
        //     return 'Factory at ' + this.pos;
        // } else if (this.gameObject instanceof StructureInvaderCore) {
        //     return 'Invader core at ' + this.pos;
        // } else if (this.gameObject instanceof StructureKeeperLair) {
        //     return 'Keeper lair at ' + this.pos;
        // } else if (this.gameObject instanceof StructureLab) {
        //     return 'Lab at ' + this.pos;
        // } else if (this.gameObject instanceof StructureLink) {
        //     return 'Link at ' + this.pos;
        // } else if (this.gameObject instanceof StructureNuker) {
        //     return 'Nuker at ' + this.pos;
        // } else if (this.gameObject instanceof StructureObserver) {
        //     return 'Observer at ' + this.pos;
        // } else if (this.gameObject instanceof StructurePowerBank) {
        //     return 'Power bank at ' + this.pos;
        // } else if (this.gameObject instanceof StructurePowerSpawn) {
        //     return 'Power spawn at ' + this.pos;
        // } else if (this.gameObject instanceof StructurePortal) {
        //     return 'Portal at ' + this.pos;
        // } else if (this.gameObject instanceof StructureRampart) {
        //     return 'Rampart at ' + this.pos;
        // } else if (this.gameObject instanceof StructureRoad) {
        //     return 'Road at ' + this.pos;
        // } else if (this.gameObject instanceof StructureSpawn) {
        //     return 'Spawn at ' + this.pos;
        // } else if (this.gameObject instanceof StructureStorage) {
        //     return 'Storage at ' + this.pos;
        // } else if (this.gameObject instanceof StructureTerminal) {
        //     return 'Terminal at ' + this.pos;
        // } else if (this.gameObject instanceof StructureTower) {
        //     return 'Tower at ' + this.pos;
        // } else if (this.gameObject instanceof StructureWall) {
        //     return 'Wall at ' + this.pos;
        // } else if (this.gameObject instanceof Tombstone) {
        //     return 'Tombstone at ' + this.pos;
        }

        return 'Unknown object ' + this.id + ' at ' + this.pos;
    }

    get pos() {
        if (this.gameObject === undefined || this.gameObject === null) {
            return undefined;
        }

        return this.gameObject.pos;
    }

    get roomName() {
        return this.gameObject.pos.roomName;
    }

    warn(message) {
        if (this.isShowingWarningMessages === false) {
            return;
        }

        console.log('[WARNING] ' + this.name + ': ' + message);
    }


}

module.exports = GameObject;