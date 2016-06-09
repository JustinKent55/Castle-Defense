-----------------------------------------------------------------------------------------
                                   Castle-Defense
-----------------------------------------------------------------------------------------

Last Release: 06 June 2016
Latest version: 1.0
Developer: Justin Kent

-----------------------------------------------------------------------------------------
                                       About
-----------------------------------------------------------------------------------------
Castle Defense is an HTML Canvas rendered game built using Javascript to control all
of the game's logic. The game follows similar TD (tower defense) games with creatures
flooding into an open area trying to reach the castle. The player's goal is to survive ten
rounds of creeps spawning on screen without losing all lives.

-----------------------------------------------------------------------------------------
                                    Requirements
-----------------------------------------------------------------------------------------
Any web browser that can run Javascript.
Tested on Chrome version 50.0

-----------------------------------------------------------------------------------------
                                  Running the Game
-----------------------------------------------------------------------------------------
This game can be launched using node.js (using express). Default node.js port is 3000.
This game can also be launched by opening public/index.html in a browser that meets the 
requirements listed above.

-----------------------------------------------------------------------------------------
                                     Gameplay
-----------------------------------------------------------------------------------------
There are four different tower types for killing creeps:
    Arrow (only targets ground creeps)
    Cannon (only targets ground creeps )
    Air (only targets air creeps)
    Mixed (only targets ground creeps in current version)
Left click on a tower type (right-hand side of the screen).
Left click again to place the selected tower inside the gameplay area.
Each tower has a gold cost associated with it.
Player starts with 50 lives.
Creeps will start by spawning at the left gate.
Creeps will not spawn at the north gate until level 5.
Creeps will not spawn at the south gate until level 6.
Air creeps do not start spawning until level 8.
Right click to cancel placing a tower (Not currently shown by UI).

-----------------------------------------------------------------------------------------
                                 Game Art & Sound
-----------------------------------------------------------------------------------------
Some of the game art has been manually created.
Most of the game art came from the following sources:
http://www.spriters-resource.com/pc_computer/warcraft2/
http://spritedatabase.net/system/pc

Sounds came from an anonymous user that had warcraft 2 sound clips

-----------------------------------------------------------------------------------------
                      Some of the Algorithms Used for Game Logic
-----------------------------------------------------------------------------------------
Creeps use a breadth first search in order to solve a path through the maze 
(public/scripts/pathing.js).

Basic trigonometry is used to calculate what a creep's angle should be while moving to the next
point in the creep's path (public/scripts/creeps.js, using -> function determineAngle(creep)).

Basic trigonometry is used to calulate which direction is the shortest when a weapon on top 
of tower rotates to target a creep. Weapons will not fire until they are pointing at a creep
(public/scripts/towerWeapons.js, using -> function rotateWeaponAngle(creeps, weapon))

Weapons create projectiles in order to kill creeps. These projectiles use collision detection
on creeps to determine if projectile should do damage to a particular creep. All collision
detection in this game uses circles with a point and radius to determine if any other circles
are inside the objects radius.
(public/scripts/collisions.js)
Note: These function is currently a brute force (n^2) algroithm to check frame rates when
there are lots of objects in the gameplay area.

Tower weapons determine which creep is closest to them and fire only at that creep.
(public/scripts/towerWeapons.js, using -> function towerScanforCreeps(...))
Note: These function is currently a brute force (n^2) algroithm to check frame rates when
there are lots of objects in the gameplay area.

-----------------------------------------------------------------------------------------
                            Future Algorithm Development
-----------------------------------------------------------------------------------------
Develop a quad tree for collision detection & tower scanning.
Graph the difference in performance between the two brute force (n^2) algorithms and
new quad-tree algorithms.

-----------------------------------------------------------------------------------------
                                Game Particle System
-----------------------------------------------------------------------------------------
Check out the public/scripts/particleSystem.js for how particles are created, managed, and 
rendered in the game.
