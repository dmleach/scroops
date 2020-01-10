class Profiles {
    getProfile (creepType) {
        for (var profileName in this) {
            var profile = profiles[profileName];

            if (profile.creepType == creepType) {
                return profile;
            }
        }

        return false;
    }
};

var profiles = new Profiles();

// Keep these in priority order of how they should spawn
profiles.harvester = require('profile.harvester');
profiles.distributor = require('profile.distributor');
profiles.upgrader = require('profile.upgrader');
profiles.builder = require('profile.builder');
profiles.scout = require('profile.scout');
profiles.importer = require('profile.importer');
profiles.scavenger = require('profile.scavenger');
profiles.hunter = require('profile.hunter');
profiles.wallbreaker = require('profile.wallbreaker');

module.exports = profiles;
