import Registry from "./classes/Registry.js";
import { ADDVELOCITYLEFT, ADDVELOCITYRIGHT, CHANGESTATE, CHANGESUB, DASHING, DASHINGFRAMES, JUMPING, JUMPINGFRAMES, LEFT, LEMON, LEVEL1BUSTER, LEVEL2BUSTER, NOSUB, PROJECTILES, RIGHT, RUNNING, RUNNINGFRAMES, SHOOTING, STANDING, STANDINGFRAMES } from "./constants/AnimationComponentConstants.js";
import { MEGAMAN } from "./constants/AssetConstants.js";
import { SPRITE } from "./constants/ComponentConstants.js";
import { ANIMATION, POSITION, RIGIDBODY, STATE } from "./constants/ComponentConstants.js";
import { CHARGING, GROUNDCOLLISION, LEFTKEYDOWN, LEFTWALLCOLLISION, RIGHTKEYDOWN, RIGHTWALLCOLLISION } from "./constants/EventConstants.js";
import { ACTIONABLE_SYSTEM, ANIMATION_SYSTEM, COLLISION_SYSTEM, HEALTH_SYSTEM, HITBOX_SYSTEM, ITEM_SYSTEM, MOVEMENT_SYSTEM, RENDER_SYSTEM, STATE_SYSTEM, TRANSITION_SYSTEM } from "./constants/SystemConstants.js";
import { ChargingState, DashingState, JumpingState, RunningState, ShootingState, StandingState } from "./states/MegamanStates.js";
import { CreateCollisionComponent, CreateMegamanXAnimationComponent, CreateRigidbodyComponent, CreatePositionComponent, CreateSpriteComponent, CreateMegamanXStateComponent, CreateHitboxComponent, CreateBusterShotAnimationComponent } from "./utilities/CreateComponents.js";


export const canvas = document.createElement("canvas");

document.getElementsByTagName("body")[0].appendChild(canvas)

canvas.width = 10000;
canvas.height = 10000;

export const c = canvas.getContext("2d");
export const TILE_SIZE = 70


const FPS = 60;
export const MILLISECONDS_PER_FRAME = 1000 / FPS           // for 60 frame a second, its 16.666 MIaLLISECONDS per frame
export const PIXELS_PER_METER = 50;


class Game {

    constructor() {
        this.player = undefined;
        this.registry = new Registry();
        this.gameTime = Date.now();
        this.isDebug = false;
        this.eventBus = { a: { aa: 1 } };           // { a: {} }
        this.audioObject = undefined;

        this.audioPath = "./assets/Sound/intro-stage-rock-remix.mp3";
        this.isPaused = false;
        this.deltaTime = 0;
        this.millisecondsPreviousFrame = 0;

        this.assets = {
            [MEGAMAN]: {
                [NOSUB]: {
                    [STANDING]: {
                        [LEFT]: [],
                        [RIGHT]: []
                    },
                    [RUNNING]: {
                        [LEFT]: [],
                        [RIGHT]: []
                    },
                    [JUMPING]: {
                        [LEFT]: [],
                        [RIGHT]: []
                    },
                    [DASHING]: {
                        [LEFT]: [],
                        [RIGHT]: []
                    }
                },
                [SHOOTING]: {
                    [STANDING]: {
                        [LEFT]: [],
                        [RIGHT]: []
                    },
                    [RUNNING]: {
                        [LEFT]: [],
                        [RIGHT]: []
                    },
                    [JUMPING]: {
                        [LEFT]: [],
                        [RIGHT]: []
                    },
                    [DASHING]: {
                        [LEFT]: [],
                        [RIGHT]: []
                    }
                },
                // static
                [PROJECTILES]: {
                    [LEMON]: {
                        [LEFT]: [],
                        [RIGHT]: []
                    },
                    [LEVEL1BUSTER]: {
                        [LEFT]: [],
                        [RIGHT]: []
                    },
                    [LEVEL2BUSTER]: {
                        [LEFT]: [],
                        [RIGHT]: []
                    }
                }


            }
        }
    }

    initialize = () => {


        this.registry.addSystem(MOVEMENT_SYSTEM);
        this.registry.addSystem(RENDER_SYSTEM);
        this.registry.addSystem(ANIMATION_SYSTEM);
        this.registry.addSystem(COLLISION_SYSTEM);
        this.registry.addSystem(TRANSITION_SYSTEM);
        this.registry.addSystem(HITBOX_SYSTEM);
        this.registry.addSystem(ACTIONABLE_SYSTEM);
        this.registry.addSystem(HEALTH_SYSTEM);
        this.registry.addSystem(ITEM_SYSTEM);
        this.registry.addSystem(STATE_SYSTEM)

        document.addEventListener("keyup", this.handleUserInput)
        document.addEventListener("keydown", this.handleUserInput)


        const p = CreatePositionComponent(1000, 50, 120, 90);
        const s = CreateSpriteComponent("./assets/X-sprites.png", { x: 0, y: 60, width: 50, height: 50 });
        const a = CreateMegamanXAnimationComponent();
        const m = CreateRigidbodyComponent(0, 0, 0, 0, 0, 0, 85);         // in kg
        const c = CreateCollisionComponent();

        const playerSprite = CreateSpriteComponent();
        let playerState = CreateMegamanXStateComponent();




        this.player = this.registry.createEntity([p, playerSprite, a, m, c, playerState]);


        // Set player initial state
        this.eventBus[this.player.id] = {}
        // Set up eventBus, run update once to set up eventbus
        Registry.getSystem(STATE_SYSTEM).initialize(this.eventBus)
        this.eventBus[this.player.id][CHANGESTATE](new JumpingState(0), this.player.id)


        let cityScapePosition = CreatePositionComponent(0, -600, 1000, 1000)
        const cityScapeSprite = CreateSpriteComponent('./assets/Background/city-scape-background.png', undefined, "background")

        this.registry.createEntity([cityScapePosition, cityScapeSprite])

        cityScapePosition.value.x += 990
        this.registry.createEntity([cityScapePosition, cityScapeSprite])

        let bridgePosition = CreatePositionComponent(0, 400, 1000, 250)
        const bridgeSprite = CreateSpriteComponent("./assets/Background/bridge.png")
        const bridgeCollision = CreateCollisionComponent();

        this.registry.createEntity([bridgeCollision, bridgeSprite, bridgePosition])

        bridgePosition = CreatePositionComponent(1000, 400, 1000, 250)
        this.registry.createEntity([bridgeCollision, bridgeSprite, bridgePosition])

        const wallPosition = CreatePositionComponent(2000, 0, 200, 650)
        const wallSprite = CreateSpriteComponent("./assets/Background/wall1.png")
        const wallCollision = CreateCollisionComponent();

        this.registry.createEntity([wallCollision, wallPosition, wallSprite])




        const backgroundSprite = CreateSpriteComponent("./assets/Background/Intro-Stage.png");
        const backgroundPosition = CreatePositionComponent(0, 0, 20000, 5000);

        // this.registry.createEntity([backgroundPosition, backgroundSprite])
        this.loadAssets();


        this.audioObject = new Audio(this.audioPath);
        this.audioObject.loop = true;
        this.audioObject.play();


    }


    run = () => {
        let timeToWait = MILLISECONDS_PER_FRAME - (Date.now() - this.millisecondsPreviousFrame);
        if (timeToWait > 0 && timeToWait <= MILLISECONDS_PER_FRAME) {
            setTimeout(() => {
                this.deltaTime = (Date.now() - this.millisecondsPreviousFrame) / 1000
                if (this.deltaTime > 0.033) {
                    this.deltaTime = 0.033
                }
                this.millisecondsPreviousFrame = Date.now();
                this.update();
                this.render();
            }, timeToWait)
        } else {
            this.deltaTime = (Date.now() - this.millisecondsPreviousFrame) / 1000
            if (this.deltaTime > 0.033) {
                this.deltaTime = 0.033
            }
            this.millisecondsPreviousFrame = Date.now();
            this.update();
            this.render();
        }

        // Set player state



        requestAnimationFrame(this.run)
    }

    update = () => {

        if (!this.isPaused) {


            this.registry.update();

            if (this.eventBus[this.player.id]) {

                if (this.eventBus[this.player.id][GROUNDCOLLISION]) {
                    delete this.eventBus[this.player.id][GROUNDCOLLISION]
                }
                if (this.eventBus[this.player.id][CHANGESUB]) {
                    delete this.eventBus[this.player.id][CHANGESUB]
                }

                if (this.eventBus[this.player.id][RIGHTWALLCOLLISION] && !this.eventBus[RIGHTKEYDOWN]) {
                    delete this.eventBus[this.player.id][RIGHTWALLCOLLISION]
                }

                if (this.eventBus[this.player.id][LEFTWALLCOLLISION] && !this.eventBus[LEFTKEYDOWN]) {
                    delete this.eventBus[this.player.id][LEFTWALLCOLLISION]
                }

            }


            Registry.getSystem(ANIMATION_SYSTEM).update(this.assets);
            Registry.getSystem(COLLISION_SYSTEM).update(this.player, this.eventBus, this.deltaTime)

            if (this.eventBus[this.player.id] && !this.eventBus[this.player.id][GROUNDCOLLISION] && this.eventBus[this.player.id][RIGHTWALLCOLLISION]) console.log(this.eventBus[this.player.id])

            Registry.getSystem(MOVEMENT_SYSTEM).update(this.deltaTime, this.eventBus)
            Registry.getSystem(HITBOX_SYSTEM).update();
            Registry.getSystem(HEALTH_SYSTEM).update(this.registry);
            Registry.getSystem(TRANSITION_SYSTEM).update(this.player, this.eventBus, this.loadNewScreen)
            Registry.getSystem(ACTIONABLE_SYSTEM).update(this.player, this.eventBus);
            Registry.getSystem(ITEM_SYSTEM).update(this.player)
            Registry.getSystem(STATE_SYSTEM).update(this.eventBus)


            // Clear certain events
            if (this.eventBus[this.player.id][GROUNDCOLLISION]) {
                this.eventBus[this.player.id][GROUNDCOLLISION]()
            }

            if (this.eventBus[this.player.id][CHANGESUB]) {
                this.eventBus[this.player.id][CHANGESUB]()
            }

            if (this.eventBus[this.player.id][RIGHTKEYDOWN] && this.eventBus[this.player.id][RIGHTWALLCOLLISION] && !this.eventBus[this.player.id][GROUNDCOLLISION]) {
                // do wall
                const rigidBody = Registry.getComponent(RIGIDBODY, this.player.id);

                rigidBody.sumForces.y += rigidBody.mass * -10.8 * PIXELS_PER_METER;





            }




        }


    }



    render = () => {
        if (!this.isPaused) {
            Registry.getSystem(RENDER_SYSTEM).update(this.isDebug, this.eventBus);
        }
    }



    handleUserInput = (e) => {
        /*
            {
                key: string
                type: string
            }
     
        */



        const { key, type } = e;


        if (this.player) {
            const { id } = this.player;
            const Position = Registry.getComponent(POSITION, id);
            const RigidBody = Registry.getComponent(RIGIDBODY, id);
            const State = Registry.getComponent(STATE, id);
            const Animation = Registry.getComponent(ANIMATION, id);
            if (type === "keydown") {

                switch (key) {
                    case "ArrowUp": {

                        break;
                    }
                    case "ArrowLeft": {

                        Animation.direction = LEFT

                        this.eventBus[id][LEFTKEYDOWN] = () => { }



                        if (this.eventBus[id][GROUNDCOLLISION] && State.currentState && State.currentState.name !== JUMPING && State.currentState.name !== DASHING && State.currentState.name !== ADDVELOCITYLEFT) {
                            if (!this.eventBus[id][RUNNING]) {
                                this.eventBus[id][RUNNING] = () => { }
                            }
                            this.eventBus[id][CHANGESTATE](new RunningState(0), id)
                        }
                        else {
                            if (!this.eventBus[id][ADDVELOCITYLEFT]) {
                                RigidBody.velocity.x -= 50;

                            }
                            this.eventBus[id][ADDVELOCITYLEFT] = () => { }
                            // this.eventBus[id][CHANGESTATE](new AddVelocityState(), id)

                        }

                        break;
                    }

                    case "ArrowDown": {

                        break;
                    }
                    case "ArrowRight": {
                        Animation.direction = RIGHT


                        this.eventBus[id][RIGHTKEYDOWN] = () => { }

                        if (this.eventBus[id][GROUNDCOLLISION] && State.currentState && State.currentState.name !== JUMPING && State.currentState.name !== DASHING && State.currentState.name !== ADDVELOCITYRIGHT) {
                            if (!this.eventBus[id][RUNNING]) {
                                this.eventBus[id][RUNNING] = () => { }
                            }
                            this.eventBus[id][CHANGESTATE](new RunningState(0), id)
                        } else {
                            if (!this.eventBus[id][ADDVELOCITYRIGHT]) {
                                RigidBody.velocity.x += 50;

                            }
                            this.eventBus[id][ADDVELOCITYRIGHT] = () => { }
                            // this.eventBus[id][CHANGESTATE](new AddVelocityState(), id)
                        }

                        break
                    }
                    case "g": {
                        this.isDebug = !this.isDebug;
                        break;
                    }
                    case "v": {
                        if (State.currentState && State.currentState.name !== DASHING && !this.eventBus[id][ADDVELOCITYLEFT] && !this.eventBus[id][ADDVELOCITYRIGHT])
                            this.eventBus[id][CHANGESTATE](new DashingState(), id)
                        break;
                    }
                    case "c": {

                        if (this.eventBus[id][GROUNDCOLLISION]) {
                            // jump
                            this.eventBus[id][CHANGESTATE](new JumpingState(), id)
                        }
                        break;
                    }
                    case "p": {
                        this.isPaused = !this.isPaused;
                        break;
                    }
                    case "f": {

                        if (State.currentSub === undefined) {
                            this.eventBus[id][CHANGESUB](new ChargingState(), id)
                        }


                        break;
                    }

                    default: {
                        break;
                    }
                }

            }
            else if (type === "keyup") {
                switch (key) {
                    case "f": {
                        if (State.currentSub === undefined || (State.currentSub && State.currentSub.name !== SHOOTING)) {
                            // Create shot
                            const State = Registry.getComponent(STATE, this.player.id);

                            let shotId, x, assetPath, hitbox, rigid, sprite, position, animation;

                            if (Animation.direction === LEFT) {
                                x = Position.x
                            } else {
                                x = Position.x + Position.width - 10
                            }

                            if (Date.now() <= State.currentSub.startTime + 1000) {
                                shotId = 0;
                                assetPath = `./assets/Projectiles/${Animation.direction}/${shotId}/0.png`

                                hitbox = CreateHitboxComponent(0, 0, 20, 20)
                                rigid = CreateRigidbodyComponent(Animation.direction === LEFT ? -500 : 500, 0, 0, 0, 0, 0, 20);
                                sprite = CreateSpriteComponent(assetPath);
                                position = CreatePositionComponent(Animation.direction === LEFT ? x : x - 10, Position.y + (Position.height / 2 - 10), 20, 20)
                                animation = CreateBusterShotAnimationComponent(shotId, Animation.direction);
                            } else if (Date.now() >= State.currentSub.startTime + 1000 && Date.now() <= State.currentSub.startTime + 2000) {
                                shotId = 1
                                assetPath = `./assets/Projectiles/${Animation.direction}/${shotId}/0.png`

                                hitbox = CreateHitboxComponent(0, 0, 20, 20)
                                rigid = CreateRigidbodyComponent(Animation.direction === LEFT ? -500 : 500, 0, 0, 0, 0, 0, 20);
                                sprite = CreateSpriteComponent(assetPath);
                                position = CreatePositionComponent(Animation.direction === LEFT ? x - 37 : x - 8, Position.y + (Position.height / 3) - 5, 50, 50)
                                animation = CreateBusterShotAnimationComponent(shotId, Animation.direction);
                            } else {
                                shotId = 2;
                                assetPath = `./assets/Projectiles/${Animation.direction}/${shotId}/0.png`

                                hitbox = CreateHitboxComponent(0, 0, 100, 100)
                                rigid = CreateRigidbodyComponent(Animation.direction === LEFT ? -500 : 500, 0, 0, 0, 0, 0, 20);
                                sprite = CreateSpriteComponent(assetPath);
                                position = CreatePositionComponent(Animation.direction === LEFT ? x - 35 : x - 10, Position.y, 100, 100)
                                animation = CreateBusterShotAnimationComponent(shotId, Animation.direction);
                            }



                            const shot = this.registry.createEntity([hitbox, rigid, sprite, position, animation]);


                            this.eventBus[id][CHANGESUB](new ShootingState(), id)
                        }
                        break;
                    }
                    case "ArrowUp": {

                        break;
                    }
                    case "ArrowDown": {
                        break;
                    }
                    case "ArrowLeft": {

                        if (this.eventBus[id][LEFTKEYDOWN]) {
                            delete this.eventBus[id][LEFTKEYDOWN];
                        }

                        if (this.eventBus[id][RUNNING]) {
                            delete this.eventBus[id][RUNNING]
                        }
                        if (this.eventBus[id][ADDVELOCITYLEFT]) {
                            delete this.eventBus[id][ADDVELOCITYLEFT]
                        }

                        this.eventBus[id][CHANGESTATE](new StandingState(), id)
                        // State.currentState = { STANDING: 0 };
                        // State.currentState.standing = 0;
                        // State.currentState.running = null;
                        break;
                    }
                    case "ArrowRight": {

                        if (this.eventBus[id][RIGHTKEYDOWN]) {
                            delete this.eventBus[id][RIGHTKEYDOWN];
                        }

                        if (this.eventBus[id][RUNNING]) {
                            delete this.eventBus[id][RUNNING]
                        }
                        if (this.eventBus[id][ADDVELOCITYRIGHT]) {
                            delete this.eventBus[id][ADDVELOCITYRIGHT]
                        }

                        this.eventBus[id][CHANGESTATE](new StandingState(), id)

                        // State.currentState.standing = 0;
                        // State.currentState.running = null;

                        break;
                    }
                    case "v": {

                        break;
                    }
                    case "c": {
                        break;
                    }
                    default: {
                        break;
                    }
                }
            }
        }
    }

    loadAssets = () => {

        // Load Megaman X assets to be used in Animations
        const modes = [RUNNING, STANDING, JUMPING, DASHING];
        const subModes = [SHOOTING, NOSUB]
        const directions = [LEFT, RIGHT]
        const basePath = "./assets/MegamanX/";

        for (let mode of modes) {
            for (let direction of directions) {
                for (let subMode of subModes) {
                    let counter = 0;
                    let endPath = ''
                    let terminatingValue = undefined;
                    if (mode === RUNNING) terminatingValue = RUNNINGFRAMES;
                    else if (mode === JUMPING) terminatingValue = JUMPINGFRAMES;
                    else if (mode === STANDING) terminatingValue = STANDINGFRAMES
                    else if (mode === DASHING) terminatingValue = DASHINGFRAMES
                    while (counter < terminatingValue) {
                        const newAsset = new Image();

                        if (subMode === NOSUB) {
                            endPath = `${mode}/${direction}/${counter}`;
                        }
                        else {
                            endPath = `${mode}/${direction}/${subMode}/${counter}`;

                        }
                        // For things like landing where this is no sub modes this will lead to an undefined path and image
                        newAsset.src = basePath + endPath + ".png";
                        this.assets[MEGAMAN][subMode][mode][direction].push(newAsset)
                        counter++;
                    }
                }
            }
        }

        // Load shots
        const shotPath = "./assets/Projectiles/"
        const shotFrames = [LEMON, LEVEL1BUSTER, LEVEL2BUSTER]

        // only 3 types of shots labeled 0 1 2 3. This corresponds to folder
        for (let i = 0; i < shotFrames.length; i++) {
            if (shotFrames[i] === null) continue;
            // get each shot animation
            for (let j = 0; j < shotFrames[i]; j++) {
                for (let direction of directions) {
                    const completeFilePath = shotPath + `${direction}/${i}/${j}.png`
                    const newAsset = new Image();
                    newAsset.src = completeFilePath;
                    // shotframes i could be level 2 buster for example
                    this.assets[MEGAMAN][PROJECTILES][shotFrames[i]][direction].push(newAsset);
                }

            }
        }

        console.log("this assets;", this.assets)
    }

}


const game = new Game();
game.initialize();
game.run();


