// class UtilError
const UtilError =
{
    ERR_NO_GIVE_TARGET: 1001,
    ERR_NO_GIVE_POSITION: 1002,
    ERR_NO_TAKE_TARGET: 1011,
    ERR_NO_TAKE_POSITION: 1012,
    ERR_NOT_WALKABLE: 1021,

    getMessageFromCode: function(code) {
        switch (code) {
            case ERR_NOT_OWNER:
                return 'You are not the owner';
            case ERR_NO_PATH:
                return 'Cannot find a path';
            case ERR_NAME_EXISTS:
                return 'Name already exists';
            case ERR_BUSY:
                return 'Game object is busy';
            case ERR_NOT_FOUND:
                return 'Cannot find';
            case ERR_NOT_ENOUGH_ENERGY:
                return 'Not enough energy';
            case ERR_NOT_ENOUGH_RESOURCES:
                return 'Not enough resources';
            case ERR_NOT_ENOUGH_EXTENSIONS:
                return 'Not enough extensions';
            case ERR_INVALID_TARGET:
                return 'Invalid target';
            case ERR_FULL:
                return 'Target is full';
            case ERR_NOT_IN_RANGE:
                return 'Target is not in range';
            case ERR_INVALID_ARGS:
                return 'Invalid arguments';
            case ERR_TIRED:
                return 'Creep is tired';
            case ERR_NO_BODYPART:
                return 'Creep does not have the right body part';
            case ERR_RCL_NOT_ENOUGH:
                return 'Room control level is not high enough';
            case ERR_GCL_NOT_ENOUGH:
                return 'Global control level is not high enough';
            case this.ERR_NO_GIVE_TARGET:
                return 'Give operation does not have a target';
            case this.ERR_NO_GIVE_POSITION:
                return 'Give operation does not have a position';
            case this.ERR_NO_TAKE_TARGET:
                return 'Take operation does not have a target';
            case this.ERR_NO_TAKE_POSITION:
                return 'Take operation does not have a position';
            case this.ERR_NOT_WALKABLE:
                return 'Position is not walkable';
        }

        return 'unknown: ' + code;
    }
};

module.exports = UtilError;