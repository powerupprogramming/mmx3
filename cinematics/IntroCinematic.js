import Registry from "../classes/Registry.js";
import { CHANGESTATE, CINEMATICS, ENTER, EXECUTE, FLYING, JUMPING, RIGHT, RUNNING, SABER, STANDING, WALL } from "../constants/AnimationComponentConstants.js";
import { DESTROYED, SPYCOPTER, ZERO } from "../constants/AssetConstants.js";
import { ANIMATION, POSITION, RIGIDBODY, SPRITE, STATE } from "../constants/ComponentConstants.js";
import { BACKGROUND, FOREGROUND, LOWESTDEPTH, MIDGROUND } from "../constants/DepthConstants.js";
import { PIXELS_PER_METER } from "../index.js";
import { JumpingState } from "../states/MegamanStates.js";
import { CreatePositionComponent, CreateSpriteComponent, CreateCollisionComponent, CreateRigidbodyComponent, CreateSpyCopterAnimationComponent, CreateBusterShotAnimationComponent, CreateZeroAnimationComponent } from "../utilities/CreateComponents.js";


// player, registry from player
// const IntroCinematic = ({ player, eventBus }) => {



// };

class IntroCinematic {
    constructor({ player, eventBus }) {
        this.player = player;
        this.eventBus = eventBus;
        this.startTime = Date.now();
        this.clouds = [];
        this.spycopters = []
        this.finalSpyCopter = undefined;
        this.events = {
            spawnedSpyCopters: false,
            finalSpyCopter: false,
            jumpOnSpyCopter: false,
            fallOnSpyCopter: false,
            shootSpyCopter: false,
            lemonsFinish: false,
            zeroJumps: false,
            zero: undefined,     // entity
            zeroLands: false,     // 
            zeroSwingsSaber: false,
            fallingToGround: false
        }
        this.lemonsShot = [];
        this.lemonsShotCounter = 0;
        this.lemonShotStart = undefined;


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

        // Spawn background copters
        if (Date.now() > this.startTime + 1000) {
            if (this.events.spawnedSpyCopters === false) {
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


                this.events.spawnedSpyCopters = true;
            }
        }

        // Spawn final copter
        if (Date.now() > this.startTime + 7000 && this.events.spawnedSpyCopters === true && this.events.finalSpyCopter === false) {
            // spycopter 1 in middle 
            let p = CreatePositionComponent(-1500, 350, 1000, 400);
            let r = CreateRigidbodyComponent(500, undefined, undefined, undefined, undefined, undefined);
            let s = CreateSpriteComponent(undefined, undefined, BACKGROUND);
            let a = CreateSpyCopterAnimationComponent()
            const s1 = registry.createEntity([p, r, s, a], SPYCOPTER)
            this.finalSpyCopter = s1;

            this.events.finalSpyCopter = true;

        }

        // hold position of spy copter and make x and zero do animations
        if (this.finalSpyCopter) {

            const finalCopterXHoldPosition = 450;

            const p = Registry.getComponent(POSITION, this.finalSpyCopter.id);
            const r = Registry.getComponent(RIGIDBODY, this.finalSpyCopter.id);

            if (p.x >= finalCopterXHoldPosition) r.velocity.x = 0;

            const playerPosition = Registry.getComponent(POSITION, this.player.id);
            const playerRigidBody = Registry.getComponent(RIGIDBODY, this.player.id);
            const playerAnimation = Registry.getComponent(ANIMATION, this.player.id)
            const playerSprite = Registry.getComponent(SPRITE, this.player.id);


            const playerState = Registry.getComponent(STATE, this.player.id);

            // when copter in positin place x in position, change state to jump state
            if (p.x > finalCopterXHoldPosition - 100 && playerState.currentState.name === STANDING && this.events.jumpOnSpyCopter === false) {

                playerPosition.x = 750
                playerPosition.y = 1000;
                this.eventBus[this.player.id][CHANGESTATE](new JumpingState(0), this.player.id)
                playerRigidBody.velocity.y = 0;
                this.events.jumpOnSpyCopter = true;
            }

            // Now move X up 
            if (this.events.jumpOnSpyCopter === true && this.events.fallOnSpyCopter === false) {
                playerRigidBody.velocity.y = -1000;
                if (playerPosition.y <= 475) {
                    this.events.fallOnSpyCopter = true;
                }
            }

            // Now onto copter
            if (this.events.fallOnSpyCopter === true && this.events.shootSpyCopter === false) {

                this.events.jumpOnSpyCopter = false;
                playerRigidBody.sumForces.y = playerRigidBody.mass * 100 * PIXELS_PER_METER;
                if (playerPosition.y >= 480) {
                    this.events.shootSpyCopter = true;
                    playerRigidBody.sumForces.y = 0; ``
                    playerRigidBody.acceleration.y = 0;
                    playerRigidBody.velocity.y = 0;
                    // Do this dirty:
                    playerAnimation.mode = WALL;
                    this.lemonShotStart = Date.now();
                }
            }

            if (this.events.shootSpyCopter === true) {


                if (this.events.lemonsFinish === false && this.lemonShotStart + 250 < Date.now()) {
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
                    this.events.zeroJumps = true;

                }

                if (this.lemonsShotCounter === 10) {
                    this.events.lemonsFinish = true;
                }








            }

            // Create zero
            if (this.events.zeroJumps === true) {
                if (this.events.zero === undefined) {
                    const a = CreateZeroAnimationComponent();
                    const r = CreateRigidbodyComponent(0, -1200, 0, 0, 0, 0, 100);
                    const s = CreateSpriteComponent(undefined, undefined, MIDGROUND);
                    const p = CreatePositionComponent(950, 1200, 180, 150);
                    this.events.zero = registry.createEntity([a, r, s, p], ZERO)

                }

                if (this.events.zero) {
                    // get position
                    const p = Registry.getComponent(POSITION, this.events.zero.id);
                    const r = Registry.getComponent(RIGIDBODY, this.events.zero.id);
                    const a = Registry.getComponent(ANIMATION, this.events.zero.id);


                    // Wait for zero above helicopter, then make fall back down
                    if (p.y <= 425 && this.events.zeroLands === false) {
                        // r.velocity.y = 0;
                        this.events.zeroLands = true;
                    }

                    // make sure to have counter=== 10 so this doesn't constantly fire
                    if (this.events.zeroLands === true && this.lemonsShotCounter !== 10) {
                        if (p.y <= 450) {
                            r.sumForces.y = r.mass * 120 * PIXELS_PER_METER;
                        } else {
                            r.sumForces.y = 0;
                            r.acceleration.y = 0;
                            r.velocity.y = 0;
                            // Do this dirty:
                            a.mode = WALL;
                            this.events.zeroSwingsSaber = true;
                            this.events.zeroLands = false;
                        }
                    }

                    // Swing saber if lemon is 8 or greater and zero swing saber istrue
                    if (this.events.zeroSwingsSaber === true && this.lemonsShotCounter >= 8) {

                        a.subMode = SABER;
                        a.mode = JUMPING;
                        // console.log("A: ", a);

                        if (a.currentFrame === 6) {
                            this.events.zeroSwingsSaber = false
                            this.events.fallingToGround = true;
                        }
                    }

                    // if current frame on last frame then just transition to jumping
                    if (this.events.fallingToGround === true) {
                        a.mode = JUMPING;
                        a.subMode = undefined;
                        a.currentFrame = 4;
                        a.alternatingFrameRange = [5, 6];
                        this.events.fallingToGround = false;

                        // make megaman fall as well
                        playerAnimation.mode = JUMPING;
                        playerAnimation.currentFrame = 4;
                        playerAnimation.frames[JUMPING].hold = 5;

                        // Now set the spycopters animation to destroyed
                        const copterA = Registry.getComponent(ANIMATION, this.finalSpyCopter.id);

                        copterA.currentFrame = 0;
                        copterA.hold = 0
                        copterA.mode = DESTROYED;
                    }
                }


            }


        }






    }

    exit = () => { };
}


export default IntroCinematic




