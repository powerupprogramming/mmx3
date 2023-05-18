import { CHARGING, KNOCKEDBACK, LANDING, PREVSTATE, RIGHT, SHOOTING, STANDING, RUNNING, CLIMBING, JUMPING, LEFT, RUNNINGFRAMES, STANDINGFRAMES, JUMPINGFRAMES, DASHING, DASHINGFRAMES } from "../constants/AnimationComponentConstants.js";
import { ANIMATION, COLLISION, RIGIDBODY, POSITION, SPRITE, STATE, HITBOX } from "../constants/ComponentConstants.js";

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

const CreateAnimationComponent = (path, srcRect) => {
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


export { CreatePositionComponent, CreateHitboxComponent, CreateCollisionComponent, CreateSpriteComponent, CreateAnimationComponent, CreateRigidbodyComponent, CreateMegamanXAnimationComponent, CreateMegamanXStateComponent }