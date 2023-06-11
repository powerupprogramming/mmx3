import IntroCinematic from "./cinematics/IntroCinematic.js";
import Registry from "./classes/Registry.js";
import { ADDVELOCITYLEFT, ADDVELOCITYRIGHT, CHANGESTATE, CHANGESUB, CINEMATICS, ENTER, DASHING, DASHINGFRAMES, EXECUTE, JUMPING, JUMPINGFRAMES, LEFT, LEMON, LEVEL1BUSTER, LEVEL2BUSTER, NOSUB, PROJECTILES, RIGHT, RUNNING, RUNNINGFRAMES, SHOOTING, STANDING, STANDINGFRAMES, SPYCOPTERFRAMES, SPYCOPTERDESTROYEDFRAMES, SPYCOPTERMODES, FLYING, PLAYERTYPE, SHOTTYPE, WALL, WALLFRAMES, SABER, ZEROJUMPINGFRAMES, ZEROWALLFRAMES, ZEROSTANDINGFRAMES, SPYCOPTERDERBRISFRAMES, ZEROJUMPINGSABERFRAMES, TELEPORTING, ZEROTELEPORTINGFRAMES, EXIT } from "./constants/AnimationComponentConstants.js";
import { ALIVE, DEBRIS, DESTROYED, ENEMIES, MEGAMAN, SPYCOPTER, ZERO } from "./constants/AssetConstants.js";
import { PLAYER, SPRITE } from "./constants/ComponentConstants.js";
import { ANIMATION, POSITION, RIGIDBODY, STATE } from "./constants/ComponentConstants.js";
import { BACKGROUND, HIGHESTDEPTH, MIDGROUND } from "./constants/DepthConstants.js";
import { CHARGING, GROUNDCOLLISION, LEFTKEYDOWN, LEFTWALLCOLLISION, RIGHTKEYDOWN, RIGHTWALLCOLLISION } from "./constants/EventConstants.js";
import { ACTIONABLE_SYSTEM, ANIMATION_SYSTEM, COLLISION_SYSTEM, HEALTH_SYSTEM, HITBOX_SYSTEM, ITEM_SYSTEM, MOVEMENT_SYSTEM, RENDER_SYSTEM, STATE_SYSTEM, TRANSITION_SYSTEM } from "./constants/SystemConstants.js";
import { ChargingState, DashingState, JumpingState, RunningState, ShootingState, StandingState, TPositionState } from "./states/MegamanStates.js";
import { CreateCollisionComponent, CreateMegamanXAnimationComponent, CreateRigidbodyComponent, CreatePositionComponent, CreateSpriteComponent, CreateMegamanXStateComponent, CreateHitboxComponent, CreateBusterShotAnimationComponent, CreateCameraComponent } from "./utilities/CreateComponents.js";


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
        this.mmxShotAudio = undefined;
        this.mmxChargingAudio = undefined;
        this.audioPath = "./assets/Sound/intro-stage-rock-remix.mp3";
        // this.audioPath = "./assets/Sound/;
        // this.inCinematic = false;
        // this.stopGravity = false;
        this.physicsSim = {
            inCinematic: false,
            stopGravity: false
        };
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
                    },
                    [WALL]: {
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
                    },
                    [WALL]: {
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


            },
            [ZERO]: {
                [NOSUB]: {
                    [JUMPING]: {
                        [LEFT]: [],
                        [RIGHT]: []
                    },
                    [WALL]: {
                        [LEFT]: [],
                        [RIGHT]: []
                    },
                    [STANDING]: {
                        [LEFT]: [],
                        [RIGHT]: []
                    },
                    [TELEPORTING]: {
                        [LEFT]: [],
                        [RIGHT]: []
                    }
                },
                [SABER]: {
                    [JUMPING]: {
                        [LEFT]: [],
                        [RIGHT]: []
                    },
                    [STANDING]: {
                        [LEFT]: [],
                        [RIGHT]: []
                    },
                    [WALL]: {
                        [LEFT]: [],
                        [RIGHT]: []
                    }
                }
            },

            [SPYCOPTER]: {
                [NOSUB]: {
                    [FLYING]: {
                        [LEFT]: [],
                        [RIGHT]: []

                    }

                },
                [DESTROYED]: [],
                [DEBRIS]: []
            },


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
        document.addEventListener('DOMContentLoaded', function () {
            // Your code here
            window.scrollTo(0, 0)
            // Set the zoom level to 50%
            document.documentElement.style.zoom = "125%";

        });

        this.loadLevel();
        this.loadAssets();


        this.audioObject = new Audio(this.audioPath);
        this.audioObject.loop = true;
        this.audioObject.play();


    }


    loadLevel = () => {

        let p = CreatePositionComponent(-500, 2050, 180, 120);
        const a = CreateMegamanXAnimationComponent();
        const m = CreateRigidbodyComponent(0, 0, 0, 0, 0, 0, 85);         // in kg
        let c = CreateCollisionComponent();

        const playerSprite = CreateSpriteComponent(undefined, undefined, 2.5);
        let playerState = CreateMegamanXStateComponent();
        const ca = CreateCameraComponent();

        this.player = this.registry.createEntity([p, playerSprite, a, m, c, ca, playerState], PLAYERTYPE)


        // Set player initial state
        this.eventBus[this.player.id] = {}
        this.eventBus[CINEMATICS] = {};
        this.eventBus[CINEMATICS][ENTER] = [];
        this.eventBus[CINEMATICS][EXECUTE] = [];
        this.eventBus[CINEMATICS][EXIT] = [];

        // Set up eventBus, run update once to set up eventbus
        Registry.getSystem(STATE_SYSTEM).initialize(this.eventBus)
        this.eventBus[this.player.id][CHANGESTATE](new StandingState(0), this.player.id)


        const event = {
            clas: IntroCinematic,
            args: {
                player: this.player,
                eventBus: this.eventBus,
                physicsSim: this.physicsSim
            }
        }

        this.eventBus[CINEMATICS][ENTER].push(event);

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

            Registry.getSystem(MOVEMENT_SYSTEM).update(this.deltaTime, this.eventBus, this.physicsSim.stopGravity)
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

            if (this.eventBus[CINEMATICS][ENTER].length > 0) {
                const { clas, args } = this.eventBus[CINEMATICS][ENTER][0]
                const c = new clas(args);

                c.enter();
                this.physicsSim["inCinematic"] = true;
                this.physicsSim["stopGravity"] = true;

            }


            if (this.eventBus[CINEMATICS][EXECUTE].length > 0) {
                const object = this.eventBus[CINEMATICS][EXECUTE][0].object;
                const args = this.eventBus[CINEMATICS][EXECUTE][0].args;

                if (object) {
                    object.execute(args);
                }
            }

            if (this.eventBus[CINEMATICS][EXIT].length > 0) {

                const object = this.eventBus[CINEMATICS][EXIT][0].object;
                const args = this.eventBus[CINEMATICS][EXIT][0].args;

                if (object) {
                    object.execute(args);

                    this.physicsSim.inCinematic = false;

                    this.eventBus[CINEMATICS][EXIT].pop();

                }



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


        if (this.player && this.physicsSim.inCinematic === false) {
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
                            this.mmxChargingAudio = new Audio("./assets/Sound/megaman-shot-charge.mp3");
                            this.mmxChargingAudio.play();
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
                            this.mmxChargingAudio.pause();
                            this.mmxChargingAudio = undefined;
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
                                sprite = CreateSpriteComponent(assetPath, undefined, MIDGROUND);
                                position = CreatePositionComponent(Animation.direction === LEFT ? x : x - 10, Position.y + (Position.height / 2 - 10), 20, 20)
                                animation = CreateBusterShotAnimationComponent(shotId, Animation.direction);
                                this.mmxShotAudio = new Audio("./assets/Sound/lemon-shot.mp3")
                                this.mmxShotAudio.play();
                            } else if (Date.now() >= State.currentSub.startTime + 1000 && Date.now() <= State.currentSub.startTime + 2000) {
                                shotId = 1
                                assetPath = `./assets/Projectiles/${Animation.direction}/${shotId}/0.png`

                                hitbox = CreateHitboxComponent(0, 0, 20, 20)
                                rigid = CreateRigidbodyComponent(Animation.direction === LEFT ? -500 : 500, 0, 0, 0, 0, 0, 20);
                                sprite = CreateSpriteComponent(assetPath, undefined, MIDGROUND);
                                position = CreatePositionComponent(Animation.direction === LEFT ? x - 37 : x - 8, Position.y + (Position.height / 3) - 5, 50, 50)
                                animation = CreateBusterShotAnimationComponent(shotId, Animation.direction);
                                this.mmxShotAudio = new Audio("./assets/Sound/medium-shot.mp3")
                                this.mmxShotAudio.play();


                            } else {
                                shotId = 2;
                                assetPath = `./assets/Projectiles/${Animation.direction}/${shotId}/0.png`

                                hitbox = CreateHitboxComponent(0, 0, 100, 100)
                                rigid = CreateRigidbodyComponent(Animation.direction === LEFT ? -500 : 500, 0, 0, 0, 0, 0, 20);
                                sprite = CreateSpriteComponent(assetPath, undefined, MIDGROUND);
                                position = CreatePositionComponent(Animation.direction === LEFT ? x - 35 : x - 10, Position.y, 100, 100)
                                animation = CreateBusterShotAnimationComponent(shotId, Animation.direction);
                                this.mmxShotAudio = new Audio("./assets/Sound/heavy-shot.mp3")
                                this.mmxShotAudio.play();
                            }



                            const shot = this.registry.createEntity([hitbox, rigid, sprite, position, animation], SHOTTYPE);



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
        let modes = [RUNNING, STANDING, JUMPING, DASHING, WALL];
        let subModes = [SHOOTING, NOSUB]
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
                    else if (mode === DASHING) terminatingValue = DASHINGFRAMES;
                    else if (mode === WALL) terminatingValue = WALLFRAMES;
                    while (counter < terminatingValue) {
                        try {
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
                        } catch (e) {

                        }

                        counter++;
                    }
                }
            }
        }

        // Load enemies
        const enemies = [SPYCOPTER];
        const enemyPath = "./assets/Enemies"
        const states = [NOSUB, DESTROYED, DEBRIS];

        modes = {
            [SPYCOPTER]: [...SPYCOPTERMODES]
        }

        for (let state of states) {
            for (let enemy of enemies) {
                for (let mode of modes[enemy]) {
                    // Jake - todo must fix - doing direction for destroyed and debris creates doubling
                    for (let direction of directions) {
                        let counter = 0;
                        let terminatingValue;
                        if (enemy === SPYCOPTER) {
                            if (state === NOSUB) terminatingValue = SPYCOPTERFRAMES;
                            if (state === DESTROYED) terminatingValue = SPYCOPTERDESTROYEDFRAMES;
                            if (state === DEBRIS) terminatingValue = SPYCOPTERDERBRISFRAMES;

                        }

                        while (counter < terminatingValue) {
                            try {
                                const newAsset = new Image();

                                if (state === NOSUB) {
                                    newAsset.src = `${enemyPath}/alive/${enemy.toLowerCase()}/${mode}/${direction}/${counter}.png`;
                                    this.assets[enemy][state][mode][direction].push(newAsset);

                                } else {
                                    newAsset.src = `${enemyPath}/${state}/${enemy.toLowerCase()}/${counter}.png`;
                                    this.assets[enemy][state].push(newAsset);

                                }

                            } catch (e) {

                            }

                            counter++;
                        }
                    }
                }
            }
        }

        // Load Zero Sprites
        modes = [JUMPING, WALL, STANDING, TELEPORTING]
        subModes = [SABER, NOSUB]
        const zeroPath = "./assets/Zero/";


        for (let mode of modes) {
            for (let direction of directions) {
                for (let subMode of subModes) {
                    let counter = 0;
                    let terminatingValue;
                    let endPath = "";
                    if (mode === JUMPING) {
                        if (subMode === NOSUB) terminatingValue = ZEROJUMPINGFRAMES;

                        if (subMode === SABER) terminatingValue = ZEROJUMPINGSABERFRAMES;
                    }
                    if (mode === WALL) terminatingValue = ZEROWALLFRAMES;
                    if (mode === STANDING) terminatingValue = ZEROSTANDINGFRAMES
                    if (mode === TELEPORTING) terminatingValue = ZEROTELEPORTINGFRAMES
                    while (counter < terminatingValue) {

                        const newAsset = new Image();

                        if (subMode === NOSUB) {
                            endPath = `${mode}/${direction}/${counter}`;
                        }
                        else {
                            endPath = `${mode}/${direction}/${subMode}/${counter}`;

                        }

                        newAsset.src = zeroPath + endPath + ".png";
                        try {
                            this.assets[ZERO][subMode][mode][direction].push(newAsset)

                        } catch (e) {

                        }

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
                    try {
                        const completeFilePath = shotPath + `${direction}/${i}/${j}.png`
                        const newAsset = new Image();
                        newAsset.src = completeFilePath;
                        // shotframes i could be level 2 buster for example
                        this.assets[MEGAMAN][PROJECTILES][shotFrames[i]][direction].push(newAsset);
                    } catch (e) {

                    }

                }

            }
        }

        console.log("this assets;", this.assets)
    }

}


const game = new Game();
game.initialize();
game.run();


