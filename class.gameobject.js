var ProfiledClass = require('class.profiled');

/**
 * GameObjectClass is the ancestor for all classes that wrap a Screeps
 * game object
 */
class GameObjectClass extends ProfiledClass {

    /**
     * The Scroops classes are envelopes around the classes provided by the
     * game. The game object around which the class is wrapped is stored
     * in the gameObject property.
     */
    constructor(gameObject) {
        super();

        this.incrementProfilerCount('GameObjectClass.constructor');

        this.gameObject = gameObject;
    }

    /**
     * Returns the id of the game object wrapped inside this class
     */
    get id() {
        this.incrementProfilerCount('GameObjectClass.id');

        return this.gameObject.id;
    }

    /**
     * Returns the name of the game object wrapped inside this class
     */
    get name() {
        this.incrementProfilerCount('GameObjectClass.name');

        return this.gameObject.name;
    }

    /**
     * Returns the position of the game object wrapped inside this class
     */
    get pos() {
        this.incrementProfilerCount('GameObjectClass.pos');

        return this.gameObject.pos;
    }

    get room() {
        this.incrementProfilerCount('GameObjectClass.room');

        return this.gameObject.room;
    }

    get roomName() {
        this.incrementProfilerCount('GameObjectClass.roomName');

        return this.gameObject.room.name;
    }

}

module.exports = GameObjectClass;
