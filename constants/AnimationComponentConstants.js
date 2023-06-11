// types:
const PLAYERTYPE = "playerType";
const SHOTTYPE = "shotType";
const SPYCOPTERTYPE = "spycopterType";

// Modes:
const TPOSITION = "tPosition";
const RUNNING = "running";
const STANDING = "standing";
const TAKEOFF = "takeoff";
const LANDING = "landing";
const JUMPING = "jumping";
const SHOOTING = "shooting";
const TELEPORTING = "teleporting";
const PROJECTILES = "projectiles"
const CHARGING = "charging";
const CHANGESTATE = "changeState";
const ADDVELOCITYLEFT = "addVelocityLeft"
const ADDVELOCITYRIGHT = "addVelocityRight"
const PREVSTATE = "prevState";
const KNOCKEDBACK = "knockedBack";
const CLIMBING = "climbing"
const TRANSITIONSTATE = "transitionState"
const CHANGESUB = "changeSub"
const NOSUB = "noSub"
const DASHING = 'dashing'
const RIGHT = "right";
const LEFT = "left";
const CINEMATICS = "cinematics";
const ENTER = "enter";
const EXECUTE = "execute";
const EXIT = "exit";
const WALL = "wall"
const SABER = "saber";

// total number of frames, don't start at 0
const STANDINGFRAMES = 3;
const JUMPINGFRAMES = 6
const RUNNINGFRAMES = 10
const DASHINGFRAMES = 2
const WALLFRAMES = 1;

const ZEROTELEPORTINGFRAMES = 4
const ZEROJUMPINGFRAMES = 7;
const ZEROJUMPINGSABERFRAMES = 11;
const ZEROSABERFRAMES = 7;
const ZEROWALLFRAMES = 1;
const ZEROSTANDINGFRAMES = 5;
// total number frames dont start at 0
const LEMON = 1;
const LEVEL1BUSTER = 6;
const LEVEL2BUSTER = 11;

// total number of spycopter frames
const SPYCOPTERFRAMES = 3;
const SPYCOPTERDESTROYEDFRAMES = 5;
const SPYCOPTERDERBRISFRAMES = 5;
const FLYING = "flying";
const SPYCOPTERMODES = [FLYING]




export {
    ZEROSTANDINGFRAMES, SPYCOPTERDERBRISFRAMES, ZEROJUMPINGSABERFRAMES, TELEPORTING, EXIT,
    ZEROJUMPINGFRAMES, ZEROSABERFRAMES, ZEROWALLFRAMES, ZEROTELEPORTINGFRAMES,
    WALL, WALLFRAMES, PLAYERTYPE, SHOTTYPE, SPYCOPTERTYPE, LEMON, ENTER,
    FLYING, SPYCOPTERMODES, SPYCOPTERDESTROYEDFRAMES, SPYCOPTERFRAMES, EXECUTE,
    TPOSITION, CINEMATICS, LEVEL1BUSTER, PROJECTILES, LEVEL2BUSTER, DASHINGFRAMES,
    NOSUB, CHANGESUB, ADDVELOCITYLEFT, ADDVELOCITYRIGHT, DASHING, STANDINGFRAMES,
    JUMPINGFRAMES, RUNNINGFRAMES, TRANSITIONSTATE, CHANGESTATE, RUNNING, STANDING,
    TAKEOFF, LANDING, JUMPING, LEFT, RIGHT, SHOOTING, CHARGING, PREVSTATE, KNOCKEDBACK, CLIMBING,
    SABER
}