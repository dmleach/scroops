var helperObstacles = {

    getOpenSpacesAroundCount: function(position) {
        var result = 0;
        var objects = false;

        for (var idxX = position.x - 1; idxX <= position.x + 1; idxX++) {
            for (var idxY = position.y - 1; idxY <= position.y + 1; idxY++) {
                if (idxX !== position.x || idxY !== position.y) {
                    if (this.isSpaceOpen(new RoomPosition(idxX, idxY, position.roomName))) {
                        result++;
                    }
                }
            }
        }

        return result;
    },

    getWalkableSpacesAroundCount: function(position) {
        var result = 0;
        var objects = false;

        for (var idxX = position.x - 1; idxX <= position.x + 1; idxX++) {
            for (var idxY = position.y - 1; idxY <= position.y + 1; idxY++) {
                if (idxX !== position.x || idxY !== position.y) {
                    if (this.isSpaceWalkable(new RoomPosition(idxX, idxY, position.roomName))) {
                        result++;
                    }
                }
            }
        }

        return result;
    },

    getWalkableSpacesInRange: function(position, range) {
        var result = [];

        for (var idxX = position.x - range + 1; idxX <= position.x + range - 1; idxX++) {
            for (var idxY = position.y - range + 1; idxY <= position.y + range - 1; idxY++) {
                if (idxX > 0 && idxX < 49 && idxY > 0 && idxY < 49) {
                    var testPosition = new RoomPosition(idxX, idxY, position.roomName);
                    if (this.isSpaceWalkable(testPosition)) {
                        result.push(testPosition)
                    }
                }
            }
        }

        return result;
    },

    isSpaceOpen: function(position) {
        if (!this.isSpaceWalkable(position)) {
            return false;
        }

        var objects = Game.rooms[position.roomName].lookAt(position.x, position.y);

        for (var idxObjects in objects) {
            var object = objects[idxObjects];

            if (['creep'].indexOf(object.type) !== -1) {
                return false;
            }
        }

        return true;
    },

    isSpaceWalkable: function(position) {
        var objects = Game.rooms[position.roomName].lookAt(position.x, position.y);

        for (var idxObjects in objects) {
            var object = objects[idxObjects];

            if (['creep','resource','tombstone'].indexOf(object.type) !== -1) {
                return true;
            }

            if (object.type == 'structure') {
                if (['constructedWall','controller','wall'].indexOf(object.structure.structureType) !== -1) {
                    return false;
                }

                if (['road'].indexOf(object.structure.structureType) !== -1) {
                    return true;
                }

                console.log('Unsure of passability of structure ' + object.structure.structureType);
            }

            if (object.type == 'terrain') {
                if (['wall'].indexOf(object.terrain) !== -1) {
                    return false;
                }

                if (['plain','swamp'].indexOf(object.terrain) !== -1) {
                    return true;
                }

                console.log('Unsure of passability of terrain ' + object.terrain);
            }
        }

        return false;
    },

}

module.exports = helperObstacles;
