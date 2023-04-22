import { POSITION, SPRITE } from "../constants/ComponentConstants.js";

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


export { CreatePositionComponent, CreateSpriteComponent }