import Registry from "../classes/Registry.js";
import { CHANGESTATE, CHANGESUB, CINEMATICS, ENTER, EXECUTE, EXIT, FLYING, JUMPING, RIGHT, RUNNING, SABER, STANDING, TELEPORTING, TRANSITIONSTATE, WALL } from "../constants/AnimationComponentConstants.js";
import { DEBRIS, DESTROYED, SPYCOPTER, ZERO } from "../constants/AssetConstants.js";
import { ANIMATION, POSITION, RIGIDBODY, SPRITE, STATE } from "../constants/ComponentConstants.js";
import { BACKGROUND, DONTRENDER, FOREGROUND, LOWESTDEPTH, MIDGROUND } from "../constants/DepthConstants.js";
import { PIXELS_PER_METER } from "../index.js";
import { JumpingState, StandingState } from "../states/MegamanStates.js";
import { CreatePositionComponent, CreateSpriteComponent, CreateCollisionComponent, CreateRigidbodyComponent, CreateSpyCopterAnimationComponent, CreateBusterShotAnimationComponent, CreateZeroAnimationComponent } from "../utilities/CreateComponents.js";



class IntroCinematic {
    constructor({ player, eventBus, physicsSim }) {
        this.player = player;
        this.eventBus = eventBus;
        this.physicsSim = physicsSim;
        this.startTime = Date.now();
        this.clouds = [];
        this.spycopters = []
        this.finalSpyCopter = undefined;
        this.events = {
            spawnedSpyCopters: undefined,
            finalSpyCopter: undefined,
            jumpOnSpyCopter: undefined,
            fallOnSpyCopter: undefined,
            shootSpyCopter: undefined,
            lemonsFinish: undefined,
            zeroJumps: undefined,
            zero: undefined,     // entity
            zeroLands: undefined,     // 
            zeroSwingsSaber: undefined,
            fallingToGround: undefined,
            landOnGround: undefined,
            chatWithZero: undefined,
            endIntro: undefined,
            end: undefined
        }
        this.lemonsShot = [];
        this.lemonsShotCounter = 0;
        this.lemonShotStart = undefined;
        this.debris = []


    };

    enter = () => {
        const { registry } = this.player;



        const PATH = `./assets/Background`;

        // Inner Pillar
        let p = CreatePositionComponent(1500, 1012, 200, 2000);
        const innerPillarSprite = CreateSpriteComponent(`${PATH}/entrance-inner-pillar.png`, undefined, BACKGROUND);
        registry.createEntity([p, innerPillarSprite])

        // sky 1 & 2 & 3
        p = CreatePositionComponent(-2, 1000, 1000, 1005);
        const skySprite = CreateSpriteComponent(`${PATH}/sky.png`, undefined, LOWESTDEPTH);
        registry.createEntity([p, skySprite]);

        p = CreatePositionComponent(980, 0, 1000, 1005);
        registry.createEntity([p, skySprite])

        p = CreatePositionComponent(-2, 0, 1000, 1005);
        registry.createEntity([p, skySprite])

        p = CreatePositionComponent(980, 1000, 1000, 1005);
        registry.createEntity([p, skySprite])



        // Background bridge position
        p = CreatePositionComponent(0, 2000, 1000, 1000);
        const backgroundBridgeSprite = CreateSpriteComponent(`${PATH}/background-bridge.png`, undefined, BACKGROUND);
        registry.createEntity([p, backgroundBridgeSprite])


        // background
        p = CreatePositionComponent(0, 2000, 2000, 1000)
        const cityScapeSprite = CreateSpriteComponent(`${PATH}/city-scape-background.png`, undefined, LOWESTDEPTH)
        registry.createEntity([p, cityScapeSprite])


        // Entrance Bridge
        p = CreatePositionComponent(0, 3000, 1800, 250)
        const bridgeSprite = CreateSpriteComponent(`${PATH}/bridge.png`, undefined, MIDGROUND)
        let c = CreateCollisionComponent();
        registry.createEntity([c, bridgeSprite, p])



        // Outer Pillar 
        p = CreatePositionComponent(1700, 2050, 200, 1225);
        const outerPillarSprite = CreateSpriteComponent(`${PATH}/entrance-outer-pillar.png`, undefined, FOREGROUND);
        registry.createEntity([p, outerPillarSprite])

        // Clouds
        // cloud 1
        p = CreatePositionComponent(10, 0, 1000, 1005);
        const r = CreateRigidbodyComponent(-500, undefined, undefined, undefined, undefined, undefined);
        const cloudSprite = CreateSpriteComponent(`${PATH}/clouds.png`, undefined, BACKGROUND);
        this.clouds.push(registry.createEntity([p, r, cloudSprite]));

        // cloud 2
        p = CreatePositionComponent(1000, 0, 1000, 1005);
        this.clouds.push(registry.createEntity([p, r, cloudSprite]));

        // // cloud 3 
        p = CreatePositionComponent(1990, 0, 1000, 1005);
        this.clouds.push(registry.createEntity([p, r, cloudSprite]));

        // cloud 4
        // p = CreatePositionComponent(2975, 0, 1000, 1005);
        // this.clouds.push(registry.createEntity([p, r, cloudSprite]));


        // GET RID OF THE ENTER
        this.eventBus[CINEMATICS][ENTER].pop();
        this.eventBus[CINEMATICS][EXECUTE].push({
            object: this,
            args: undefined
        });

    };

    execute = () => {

        for (let cloud of this.clouds) {
            const { id } = cloud;
            let cloudPositionComponent = Registry.getComponent(POSITION, id);

            if (cloudPositionComponent.x < -1000) cloudPositionComponent.x = 1950;

        }

        // Create spy copters at 1 and a half seconds
        const { registry } = this.player;

        if (this.events.endIntro === undefined) {      // Spawn background copters
            if (Date.now() > this.startTime + 1000 && this.events.chatWithZero === undefined) {
                if (this.events.spawnedSpyCopters === undefined) {
                    // spycopter 1 in middle 
                    let p = CreatePositionComponent(-500, 400, 500, 200);
                    let r = CreateRigidbodyComponent(500, undefined, undefined, undefined, undefined, undefined);
                    let s = CreateSpriteComponent(undefined, undefined, BACKGROUND);
                    let a = CreateSpyCopterAnimationComponent()
                    const s1 = registry.createEntity([p, r, s, a])
                    this.spycopters.push(s1);

                    // far away
                    p = CreatePositionComponent(-1000, 250, 300, 100);
                    r = CreateRigidbodyComponent(300, undefined, undefined, undefined, undefined, undefined);
                    this.spycopters.push(registry.createEntity([p, r, s, a]));

                    // closer up
                    r = CreateRigidbodyComponent(600, undefined, undefined, undefined, undefined, undefined);
                    p = CreatePositionComponent(-3000, 600, 650, 300);
                    this.spycopters.push(registry.createEntity([p, r, s, a]));


                    this.events.spawnedSpyCopters = Date.now();
                }
            }

            // Spawn final copter
            if (this.events.chatWithZero === undefined && Date.now() > this.startTime + 7000 && this.events.spawnedSpyCopters !== undefined && this.events.finalSpyCopter === undefined) {
                // spycopter 1 in middle 
                let p = CreatePositionComponent(-1500, 350, 1000, 400);
                let r = CreateRigidbodyComponent(500, 0, 0, 0, 0, 0, 85);

                let s = CreateSpriteComponent(undefined, undefined, BACKGROUND);
                let a = CreateSpyCopterAnimationComponent()
                const s1 = registry.createEntity([p, r, s, a], SPYCOPTER)
                this.finalSpyCopter = s1;

                this.events.finalSpyCopter = Date.now();

            }

            // hold position of spy copter and make x and zero do animations
            if (this.finalSpyCopter && this.events.chatWithZero === undefined) {

                const finalCopterXHoldPosition = 450;

                const p = Registry.getComponent(POSITION, this.finalSpyCopter.id);
                const r = Registry.getComponent(RIGIDBODY, this.finalSpyCopter.id);

                if (p.x >= finalCopterXHoldPosition && this.events.fallOnSpyCopter === undefined) r.velocity.x = 0;

                const playerPosition = Registry.getComponent(POSITION, this.player.id);
                const playerRigidBody = Registry.getComponent(RIGIDBODY, this.player.id);
                const playerAnimation = Registry.getComponent(ANIMATION, this.player.id)
                const playerSprite = Registry.getComponent(SPRITE, this.player.id);


                const playerState = Registry.getComponent(STATE, this.player.id);

                // when copter in positin place x in position, change state to jump state
                if (p.x > finalCopterXHoldPosition - 100 && playerState.currentState.name === STANDING && this.events.jumpOnSpyCopter === undefined) {

                    playerPosition.x = 750
                    playerPosition.y = 1000;
                    this.eventBus[this.player.id][CHANGESTATE](new JumpingState(0), this.player.id)
                    playerRigidBody.velocity.y = 0;
                    this.events.jumpOnSpyCopter = Date.now();
                }

                // Now move X up 
                if (this.events.jumpOnSpyCopter !== undefined && this.events.fallOnSpyCopter === undefined) {
                    playerRigidBody.velocity.y = -1000;
                    if (playerPosition.y <= 475) {
                        this.events.fallOnSpyCopter = Date.now();
                    }
                }

                // Now onto copter
                if (this.events.fallOnSpyCopter !== undefined && this.events.shootSpyCopter === undefined) {

                    this.events.jumpOnSpyCopter = undefined;
                    playerRigidBody.sumForces.y = playerRigidBody.mass * 100 * PIXELS_PER_METER;
                    if (playerPosition.y >= 480) {
                        this.events.shootSpyCopter = Date.now();
                        playerRigidBody.sumForces.y = 0;
                        playerRigidBody.acceleration.y = 0;
                        playerRigidBody.velocity.y = 0;
                        // Do this dirty:
                        playerAnimation.mode = WALL;
                        this.lemonShotStart = Date.now();
                    }
                }

                if (this.events.shootSpyCopter !== undefined) {


                    if (this.events.lemonsFinish === undefined && this.lemonShotStart + 250 < Date.now()) {
                        const shotId = 0;
                        const assetPath = `./assets/Projectiles/right/${shotId}/0.png`

                        const lemonR = CreateRigidbodyComponent(500, 0, 0, 0, 0, 0, 20);
                        const lemonS = CreateSpriteComponent(assetPath, undefined, MIDGROUND);
                        const lemonP = CreatePositionComponent(playerPosition.x + 100, playerPosition.y + (playerPosition.height / 2 - 10), 20, 20)
                        const lemonA = CreateBusterShotAnimationComponent(shotId, RIGHT);
                        // new Audio("../assets/Sound/lemon-shot.mp3").play();

                        this.lemonsShot.push(registry.createEntity([lemonR, lemonS, lemonP, lemonA]))
                        this.lemonsShotCounter++;
                        this.lemonShotStart = Date.now();



                    }

                    for (let i = 0; i < this.lemonsShot.length; i++) {

                        const lemon = this.lemonsShot[i];
                        const lp = Registry.getComponent(POSITION, lemon.id);
                        // remove
                        if (lp.x >= 900) {

                            // dirty
                            this.lemonsShot = this.lemonsShot.slice(0, i).concat(this.lemonsShot.slice(i + 1));

                            lemon.registry.entitiesToBeKilled.push(lemon);

                        }

                    }

                    if (this.lemonsShotCounter === 3) {
                        this.events.zeroJumps = Date.now();

                    }

                    if (this.lemonsShotCounter === 10) {
                        this.events.lemonsFinish = Date.now();
                    }








                }

                // Create zero
                if (this.events.zeroJumps !== undefined && this.events.chatWithZero === undefined) {
                    if (this.events.zero === undefined) {
                        const a = CreateZeroAnimationComponent();
                        const r = CreateRigidbodyComponent(0, -1200, 0, 0, 0, 0, 100);
                        const s = CreateSpriteComponent(undefined, undefined, MIDGROUND);
                        const p = CreatePositionComponent(950, 1200, 180, 140); // 150 110
                        const c = CreateCollisionComponent();
                        this.events.zero = registry.createEntity([a, r, s, p, c], ZERO)

                    }

                    if (this.events.zero) {
                        // get position
                        const p = Registry.getComponent(POSITION, this.events.zero.id);
                        const r = Registry.getComponent(RIGIDBODY, this.events.zero.id);
                        const a = Registry.getComponent(ANIMATION, this.events.zero.id);


                        // Wait for zero above helicopter, then make fall back down
                        if (p.y <= 425 && this.events.zeroLands === undefined) {
                            // r.velocity.y = 0;
                            this.events.zeroLands = Date.now();
                        }

                        // make sure to have counter=== 10 so this doesn't constantly fire
                        if (this.events.zeroLands !== undefined && this.lemonsShotCounter !== 10) {
                            if (p.y <= 450) {
                                r.sumForces.y = r.mass * 120 * PIXELS_PER_METER;
                            } else {
                                r.sumForces.y = 0;
                                r.acceleration.y = 0;
                                r.velocity.y = 0;
                                // Do this dirty:
                                a.mode = WALL;
                                this.events.zeroSwingsSaber = Date.now();
                                this.events.zeroLands = undefined;
                            }
                        }

                        // Swing saber if lemon is 8 or greater and zero swing saber istrue
                        if (this.events.zeroSwingsSaber !== undefined && Date.now() > this.events.zeroSwingsSaber + 700 && this.lemonsShotCounter >= 5) {

                            a.subMode = SABER;
                            a.mode = JUMPING;

                            if (a.currentFrame === 6) {
                                this.events.zeroSwingsSaber = undefined
                                this.events.fallingToGround = Date.now();
                            }
                        }

                        // if current frame on last frame then just transition to jumping
                        if (this.events.fallingToGround !== undefined && this.events.landOnGround === undefined) {
                            a.mode = JUMPING;
                            a.subMode = undefined;
                            a.currentFrame = 4;
                            a.alternatingFrameRange = [5, 6];
                            this.events.fallingToGround = undefined;

                            // make megaman fall as well
                            playerAnimation.mode = JUMPING;
                            playerAnimation.currentFrame = 5;
                            playerAnimation.frames[JUMPING].hold = 5;

                            // Now set the spycopters animation to destroyed
                            const copterA = Registry.getComponent(ANIMATION, this.finalSpyCopter.id);
                            const copterR = Registry.getComponent(RIGIDBODY, this.finalSpyCopter.id);
                            const copterP = Registry.getComponent(POSITION, this.finalSpyCopter.id);

                            copterA.currentFrame = 0;
                            copterA.hold = 0
                            copterA.mode = DESTROYED;

                            // create explosions
                            // no sprites 

                            // spyCopter fall
                            copterR.velocity.y = 500;

                            // zero fall
                            const zeroR = Registry.getComponent(RIGIDBODY, this.events.zero.id);
                            zeroR.velocity.y = 500;

                            playerRigidBody.velocity.y = 500;
                            this.events.landOnGround = Date.now();

                        }


                        if (this.events.landOnGround !== undefined) {

                            // get zero 
                            const copterP = Registry.getComponent(POSITION, this.finalSpyCopter.id);
                            const copterR = Registry.getComponent(RIGIDBODY, this.finalSpyCopter.id);
                            const copterS = Registry.getComponent(SPRITE, this.finalSpyCopter.id);


                            const zeroP = Registry.getComponent(POSITION, this.events.zero.id);
                            const zeroR = Registry.getComponent(RIGIDBODY, this.events.zero.id);
                            const zeroA = Registry.getComponent(ANIMATION, this.events.zero.id);

                            if (zeroP.y >= 2897) {
                                zeroR.velocity.y = 0;
                                zeroA.alternatingFrameRange = undefined;
                                // because messed up sprite crop
                                zeroP.width = 150;
                                zeroP.height = 110
                                zeroA.mode = STANDING;
                            }
                            if (copterP.y >= 2700) {
                                copterR.velocity.y = 0;


                                if (this.debris.length === 0) {
                                    // Create debris pieces
                                    let p = CreatePositionComponent(copterP.x + 100, copterP.y + copterP.height - 50, 250, 250);
                                    let r = CreateRigidbodyComponent(-700, -800, 0, 0, 0, 0, 200)
                                    let s = CreateSpriteComponent("../assets/Enemies/debris/0.png", undefined, MIDGROUND);
                                    this.debris.push(registry.createEntity([p, r, s], DEBRIS))


                                    p = CreatePositionComponent(copterP.x + 250, copterP.y + 250, 100, 50);
                                    r = CreateRigidbodyComponent(-200, -700, 0, 0, 0, 0, 150)
                                    s = CreateSpriteComponent("../assets/Enemies/debris/1.png", undefined, MIDGROUND);
                                    this.debris.push(registry.createEntity([p, r, s], DEBRIS))


                                    p = CreatePositionComponent(copterP.x + 300, copterP.y + 250, 200, 100);
                                    r = CreateRigidbodyComponent(200, -700, 0, 0, 0, 0, 100)
                                    s = CreateSpriteComponent("../assets/Enemies/debris/2.png", undefined, MIDGROUND);
                                    this.debris.push(registry.createEntity([p, r, s], DEBRIS))

                                    p = CreatePositionComponent(copterP.x + copterP.width - 300, copterP.y + 100, 250, 200);
                                    r = CreateRigidbodyComponent(500, -700, 0, 0, 0, 0, 250)
                                    s = CreateSpriteComponent("../assets/Enemies/debris/3.png", undefined, MIDGROUND);
                                    this.debris.push(registry.createEntity([p, r, s], DEBRIS))

                                    p = CreatePositionComponent(copterP.x + 200, copterP.y + 200, 200, 125);
                                    r = CreateRigidbodyComponent(400, -500, 0, 0, 0, 0, 200)
                                    s = CreateSpriteComponent("../assets/Enemies/debris/4.png", undefined, MIDGROUND);
                                    this.debris.push(registry.createEntity([p, r, s], DEBRIS))

                                    p = CreatePositionComponent(copterP.x, copterP.y + 250, 100, 50);
                                    r = CreateRigidbodyComponent(-1000, -2000, 0, 0, 0, 0, 200)
                                    s = CreateSpriteComponent("../assets/Enemies/debris/5.png", undefined, MIDGROUND);
                                    this.debris.push(registry.createEntity([p, r, s], DEBRIS))



                                    copterS.depth = DONTRENDER;

                                    this.physicsSim.stopGravity = false;
                                }

                                // // registry.entitiesToBeKilled.push(this.finalSpyCopter);
                                // this.finalSpyCopter = 1;            // keep it having a value so itll still evaluate to true above

                            }

                            if (playerPosition.y >= 2895) {
                                playerAnimation.frames[JUMPING].hold = undefined;

                                playerPosition.y = 2900;
                                playerRigidBody.velocity.y = 0;
                            }

                            if (playerRigidBody.velocity.y === 0 && zeroR.velocity.y === 0) {
                                this.events.chatWithZero = Date.now();

                            }


                        }
                    }


                }


            }


            if (this.events.chatWithZero !== undefined && this.events.endIntro === undefined) {

                const playerS = Registry.getComponent(STATE, this.player.id);
                this.eventBus[this.player.id][TRANSITIONSTATE](new StandingState(0), this.player.id)

                // chat box opens up

                // zero teleports away
                const zeroA = Registry.getComponent(ANIMATION, this.events.zero.id);
                const zeroP = Registry.getComponent(POSITION, this.events.zero.id);
                const zeroR = Registry.getComponent(RIGIDBODY, this.events.zero.id);

                // wait
                if (this.events.chatWithZero + 2000 < Date.now()) {
                    zeroA.mode = TELEPORTING;
                    // zeroA.currentTimeOfAnimation = Date.now()
                    zeroA.startOfAnimation = Date.now();
                    // zeroA.currentFrame = 0
                    zeroR.velocity.y = -1000;

                    this.events.endIntro = Date.now()
                }

            }
        }

        if (this.events.endIntro !== undefined && this.events.end === undefined) {
            if (this.events.endIntro + 2000 < Date.now()) {

                this.eventBus[CINEMATICS][EXECUTE].pop();
                this.eventBus[CINEMATICS][EXIT].push({
                    object: this,
                    args: undefined
                });
                this.events.end = Date.now()
            }
        }




    }

    exit = () => {

        const { registry } = this.player;

        // clear the clouds
        for (let i = 0; i < this.clouds.length; i++) {
            registry.entitiesToBeKilled.push(this.clouds[i])
        }

        // clear spycopters
        for (let i = 0; i < this.spycopters.length; i++) {
            registry.entitiesToBeKilled.push(this.spycopters[i]);
        }

        // clear final spycopter
        registry.entitiesToBeKilled.push(this.finalSpyCopter);

        // clear lemon shots
        for (let i = 0; i < this.lemonsShotCounter; i++) {
            registry.entitiesToBeKilled.push(this.lemonsShot[i])
        }

        // clear debris
        for (let i = 0; i < this.debris.length; i++) {
            registry.entitiesToBeKilled.push(this.debris[i]);
        }


        delete this;


    };
}


export default IntroCinematic




