/**
 * The base class for all objects
 */

class BaseClass {

    /**
     * The Scroops classes are envelopes around the classes provided by the
     * game. The game object around which the class is wrapped is stored
     * in the gameObject property.
     */
    constructor(gameObject) {
        this.gameObject = gameObject;
    }

    /**
     * Writes the given message to the console log if this object's id is in
     * the array of debug ids
     */
    debugLog(message) {
        let debugIds = [];

        if (debugIds.indexOf(this.id) !== -1) {
            console.log('[' + this.name + '] ' + message);
        }
    }

    /**
     * Returns the id of the game object wrapped inside this class
     */
    get id() {
        return this.gameObject.id;
    }

    /**
     * Returns the name of the game object wrapped inside this class
     */
    get name() {
        return this.gameObject.name;
    }

    /**
     * Returns the position of the game object wrapped inside this class
     */
    get pos() {
        return this.gameObject.pos;
    }

    get room() {
        return this.gameObject.room;
    }

    get roomName() {
        return this.gameObject.room.name;
    }
}

module.exports = BaseClass;
