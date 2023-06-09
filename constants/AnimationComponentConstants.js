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

// total number of frames, don't start at 0
const STANDINGFRAMES = 3;
const JUMPINGFRAMES = 6
const RUNNINGFRAMES = 10
const DASHINGFRAMES = 2

// total number frames dont start at 0
const LEMON = 1;
const LEVEL1BUSTER = 6;
const LEVEL2BUSTER = 11;

// total number of spycopter frames
const SPYCOPTERFRAMES = 3;
const SPYCOPTERDESTROYEDFRAMES = 5;
const FLYING = "flying";
const SPYCOPTERMODES = [FLYING]




export { PLAYERTYPE, SHOTTYPE, SPYCOPTERTYPE, LEMON, ENTER, FLYING, SPYCOPTERMODES, SPYCOPTERDESTROYEDFRAMES, SPYCOPTERFRAMES, EXECUTE, TPOSITION, CINEMATICS, LEVEL1BUSTER, PROJECTILES, LEVEL2BUSTER, DASHINGFRAMES, NOSUB, CHANGESUB, ADDVELOCITYLEFT, ADDVELOCITYRIGHT, DASHING, STANDINGFRAMES, JUMPINGFRAMES, RUNNINGFRAMES, TRANSITIONSTATE, CHANGESTATE, RUNNING, STANDING, TAKEOFF, LANDING, JUMPING, LEFT, RIGHT, SHOOTING, CHARGING, PREVSTATE, KNOCKEDBACK, CLIMBING }