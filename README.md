TO-DO
* Teach creeps to act like harvesters if there are no harvesters
* Consider having the room manager direct creeps according to body rather than name
* Automatically determine where to build containers
* Teach builders to repair structures before they collapse, even when build sites are available
* Implement maximum body for creeps
* Teach builders not to repair if there's a tower with energy
* Cache WorldManager results in memory
* Create a base configuration file from which structures are built and defined
* Distribute the importers among different neighboring sources
* Scouts need to go into neighboring rooms even if they're visible
* Respawn harvesters if the room is full of energy and it would make a better harvester
* Teach creep with no target to move to a space with nothing around it
* Stop distributors from freaking out and dancing around the spawn when a new creep is spawning
* Figure out why distributors aren't dropping energy into containers, but standing next to them holding energy instead
* Make one code improvement: Create a sorted values class for returning search results in a particular order
* Make one code improvement: Move give energy and take energy logic by class out of the creep ancestor
* Explicitly define the order in which creeps should spawn
* Explicitly define the order in which creeps should work
* Creeps should not shove other creeps out of the way until all their move alternatives are examined
* Creeps that cannot take energy because the spawns and extensions are not full should move to where they'll take energy from when they can
* Don't spawn a scout for a neighboring room that can't be reached
* Use PathFinder to find paths

DONE
1. Harvest energy and deposit it into the spawn
1. Make one code improvement: Create the CreepHarvester class
1. Withdraw energy from the spawn and upgrade the controller
1. Make one code improvement: Create an enumeration for creep roles
1. Remove hard coded ids for which creep is which
1. Make one code improvement: Make the role enumeration iterable
1. Spawn creeps on an as-needed basis
1. Remove hard coded sequence of spawning creeps
1. Make one code improvement: Abstract creep ancestor class
1. Build energy container for the harvesters
1. Make one code improvement: Move determination of role to spawn into a different class
1. Teach harvesters how to use the container
1. Make one code improvement: abstract earner and spender creeps
1. Build energy container for the upgraders
1. Make one code improvement: Refactor harvester class to use ancestor class
1. Make one code improvement: Refactor upgrader class to use ancestor class
1. Create room class that chooses targets for creeps
1. Make one code improvement: Refactor harvester class to use room class
1. Make one code improvement: Refactor upgrader class to use room class
1. Make one code improvement: Refactor builder class to use room class
1. Teach builders how to look for building sites
1. Teach upgraders how to use the container
1. Teach builders to repair structures
1. Make one code improvement: move spawning into its own class
1. Automatically determine where creeps should stand to execute their actions
1. Make one code improvement: move definitions of give and take targets to creep classes
1. Give builders a maximum limit for repairing structures
1. Have builders act like upgraders when they have nothing better to do
1. Create distributors
1. Teach harvesters to drop energy before harvesting over their capacity
1. Make one code improvement: Clean up the main game loop
1. Allow for different numbers of each type of creep
1. Make one code improvement: add debug mode to creeps, only say and log when it's true
1. Teach spenders to take energy from the closest container, not the fullest container
1. Spawn better creeps if more energy is available
1. Make one code improvement: move give and take energy code into the ancestor
1. Teach distributors to plan their entire move at once to prevent the blinking problem
1. Make one code improvement: Refactor the room manager search code to be less repetitious
1. Teach distributors to only take from harvester containers
1. Create a path mapping and caching class
1. Teach distributors to put energy into towers
1. Create scouts
1. Teach tower to attack unfriendly creeps
1. Teach tower to repair friendly structures
1. Create importers
1. Create warriors
1. Teach harvesters to drop energy on the ground if distributors are in play
1. Don't spawn until the room is at full energy
1. Have all creeps use UtilPath for movement
1. Create scavengers, remove dropped resources and tombstones from distributors
1. Teach scavenger to act like a distributor if there are no resources or tombstones
1. Make one code improvement: Create a game object ancestor class
1. Add code that outputs meaningful names instead of ids and codes when debugging
1. Teach distributors to fill extensions according to which is closest, not just in the order provided
1. Stop importers from dropping their energy on the ground next to a container
1. Make one code improvement: Create a memory accessor ancestor object
1. Reduce costly calls to findExit
1. Make one code improvement: Abstract debug/error/warn to its own ancestor class so non-game objects can use them
