class ScroopsObject
{
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

    error(errorCode, message = '') {
        if (this.isShowingErrorMessages === false) {
            return;
        }

        let UtilErrorClass = require('UtilError');
        message = '[ERROR ' + errorCode + ': ' + UtilErrorClass.getMessageFromCode(errorCode)  + '] ' + this.name + ': ' + message;

        console.log(message.replace(/:$/, ''));
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

    warn(message) {
        if (this.isShowingWarningMessages === false) {
            return;
        }

        console.log('[WARNING] ' + this.name + ': ' + message);
    }
}

module.exports = ScroopsObject;