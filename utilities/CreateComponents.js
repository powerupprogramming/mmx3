import { CHARGING, KNOCKEDBACK, LANDING, PREVSTATE, RIGHT, SHOOTING, STANDING, RUNNING, CLIMBING, JUMPING, LEFT, RUNNINGFRAMES, STANDINGFRAMES, JUMPINGFRAMES } from "../constants/AnimationComponentConstants.js";
import { ANIMATION, COLLISION, RIGIDBODY, POSITION, SPRITE, STATE } from "../constants/ComponentConstants.js";

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


// path: string, srcRect: {x: number, y: number, width: number, height number}
// return dummySprite
const CreateSpriteComponent = (path, srcRect) => {
    const d = {
        name: SPRITE,
        value: {
            path,
            srcRect
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
            // mainStates: {
            //     [STANDING]: null,       // null = not used, 0/1/2/3/etc is frame
            //     [RUNNING]: null,
            //     [CLIMBING]: null,
            //     [JUMPING]: null
            // },
            // combinationStates: {
            //     [SHOOTING]: false,
            //     [CHARGING]: false
            // },
            // pureTransitions: {
            //     [KNOCKEDBACK]: PREVSTATE,
            //     [LANDING]: STANDING
            // }

            holdCurrentState: false,
            prevState: undefined,
            currentState: undefined,


            prevGlobalState: undefined,
            globalState: undefined,
            // possibleStates: {
            //     mainStates: {
            //         [STANDING]: null,       // null = not used, 0/1/2/3/etc is frame
            //         [RUNNING]: null,
            //         [CLIMBING]: null,
            //         [JUMPING]: null
            //     },
            //     combinationStates: {
            //         [SHOOTING]: false,
            //         [CHARGING]: false
            //     },
            //     pureTransitions: {
            //         [KNOCKEDBACK]: [PREVSTATE],
            //         [LANDING]: [STANDING]
            //     }
            // }
        }
    }
    return d;
}


export { CreatePositionComponent, CreateCollisionComponent, CreateSpriteComponent, CreateAnimationComponent, CreateRigidbodyComponent, CreateMegamanXAnimationComponent, CreateMegamanXStateComponent }