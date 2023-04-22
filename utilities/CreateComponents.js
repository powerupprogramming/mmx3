import { ANIMATION, POSITION, SPRITE } from "../constants/ComponentConstants.js";

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

const CreateMegamanXAnimationComponent = () => {
    const d = {
        name: ANIMATION,
        value: {
            path: "../assets/X-sprites.png",
            mode: "standing",
            direction: "right",
            frames: {
                standing: {
                    animationLength: 2000,
                    right: {
                        srcRect: [
                            { x: 265, y: 10, width: 46, height: 52 },
                            { x: 307, y: 10, width: 46, height: 52 },
                            { x: 390, y: 10, width: 46, height: 52 },
                        ]
                    }
                },
                running: {
                    animationLength: 200,
                    right: {
                        srcRect: [

                            // { x: 0, y: 60, width: 45, height: 50, animationLength: 0.5 },
                            { x: 41, y: 60, width: 45, height: 52 },
                            { x: 83, y: 60, width: 40, height: 50 },
                            { x: 124, y: 60, width: 40, height: 50 },
                            { x: 165, y: 60, width: 40, height: 50 },

                        ]
                    }

                }
            }
        }
    }
    return d;
}


export { CreatePositionComponent, CreateSpriteComponent, CreateAnimationComponent, CreateMegamanXAnimationComponent }