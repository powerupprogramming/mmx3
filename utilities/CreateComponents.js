import { RIGHT } from "../constants/AnimationComponentConstants.js";
import { ANIMATION, COLLISION, RIGIDBODY, POSITION, SPRITE } from "../constants/ComponentConstants.js";

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
            mode: "standing",
            direction: RIGHT,
            frames: {
                standing: {
                    animationLength: 2000,
                    right: 3
                },
                running: {
                    animationLength: 100,
                    right: 10
                }
            }
        }
    }
    return d;
}


export { CreatePositionComponent, CreateCollisionComponent, CreateSpriteComponent, CreateAnimationComponent, CreateRigidbodyComponent, CreateMegamanXAnimationComponent }