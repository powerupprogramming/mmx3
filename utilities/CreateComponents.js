import { CHARGING, KNOCKEDBACK, LANDING, PREVSTATE, RIGHT, SHOOTING, STANDING, RUNNING, CLIMBING, JUMPING, LEFT, RUNNINGFRAMES, STANDINGFRAMES, JUMPINGFRAMES, DASHING, DASHINGFRAMES, LEVEL2BUSTER, LEMON, LEVEL1BUSTER, FLYING, SPYCOPTERFRAMES } from "../constants/AnimationComponentConstants.js";
import { ANIMATION, COLLISION, RIGIDBODY, POSITION, SPRITE, STATE, HITBOX, CAMERA } from "../constants/ComponentConstants.js";

// x: number, y : number, width: number: height: number
// return dummyPosition
const CreatePositionComponent = (x, y, width, height) => {

    const d = {
        name: POSITION,
        value: {
            x, y, width, height
        }
    }
    return d;
}


const CreateHitboxComponent = (xOffset, yOffset, width, height) => {
    const d = {
        name: HITBOX,
        value: {
            xOffset,
            yOffset,
            width,
            height
        }
    }

    return d;
}


// path: string, srcRect: {x: number, y: number, width: number, height number}
// return dummySprite
const CreateSpriteComponent = (path, srcRect, depth) => {
    const d = {
        name: SPRITE,
        value: {
            path,
            srcRect,
            depth
        }
    }
    return d;
};

const CreateAnimationComponent = (frames) => {
    const d = {
        name: ANIMATION,
        value: {
            frames
        }
    }
    return d;
};

const CreateRigidbodyComponent = (vX, vY, aX, aY, sX, sY, mass) => {
    const d = {
        name: RIGIDBODY,
        value: {
            vX, vY, aX, aY, sX, sY, mass
        }
    };

    return d;
}

const CreateCollisionComponent = () => {
    const d = {
        name: COLLISION
    };
    return d;
}

const CreateBusterShotAnimationComponent = (shotId, direction) => {

    console.log("Shot id: ", shotId, " direction: ", direction)

    let alternatingFrameRange
    let numFrames = 0;

    if (shotId === 0) {
        alternatingFrameRange = [0];
        numFrames = LEMON
    }
    else if (shotId === 1) {
        alternatingFrameRange = [3, 5]
        numFrames = LEVEL1BUSTER;
    }
    else {
        // shot id === 2
        alternatingFrameRange = [8, 10]      // 8 is name of png to start, 10 is ending
        numFrames = LEVEL2BUSTER;
    }

    const d = {
        name: ANIMATION,
        value: {
            direction,
            alternatingFrameRange,
            frames: {
                numFrames,
                animationLength: 100
            }
        }
    };

    return d;
}

const CreateSpyCopterAnimationComponent = () => {

    const d = {
        name: ANIMATION,
        value: {
            src: undefined,
            mode: FLYING,
            direction: RIGHT,
            frames: {
                [FLYING]: {
                    animationLength: 100,
                    [RIGHT]: SPYCOPTERFRAMES,
                    [LEFT]: SPYCOPTERFRAMES
                }
            }
        }
    }

    return d;
}

const CreateMegamanXAnimationComponent = () => {
    const d = {
        name: ANIMATION,
        value: {
            // path: "../assets/X-sprites.png",
            src: undefined,
            mode: STANDING,
            direction: RIGHT,
            frames: {
                [STANDING]: {
                    animationLength: 2000,
                    [RIGHT]: STANDINGFRAMES,
                    [LEFT]: STANDINGFRAMES
                },
                [RUNNING]: {
                    animationLength: 100,
                    [RIGHT]: RUNNINGFRAMES,
                    [LEFT]: RUNNINGFRAMES
                },
                [JUMPING]: {
                    animationLength: 100,
                    hold: 5,
                    [RIGHT]: JUMPINGFRAMES,
                    [LEFT]: JUMPINGFRAMES
                },
                [DASHING]: {
                    animationLength: 300,
                    hold: 1,
                    [RIGHT]: DASHINGFRAMES,
                    [LEFT]: DASHINGFRAMES,

                }
            }
        }
    }
    return d;
}

const CreateCameraComponent = () => {
    const d = {
        name: CAMERA,
        value: {}
    }
    return d;
}


const CreateMegamanXStateComponent = () => {
    const d = {
        name: STATE,
        value: {
            holdCurrentState: false,
            prevState: undefined,
            currentState: undefined,


            prevGlobalState: undefined,
            globalState: undefined,

        }
    }
    return d;
}


export { CreateBusterShotAnimationComponent, CreateCameraComponent, CreateSpyCopterAnimationComponent, CreatePositionComponent, CreateHitboxComponent, CreateCollisionComponent, CreateSpriteComponent, CreateAnimationComponent, CreateRigidbodyComponent, CreateMegamanXAnimationComponent, CreateMegamanXStateComponent }