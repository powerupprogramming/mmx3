import Registry from "../classes/Registry.js";
import { CHANGESTATE, CINEMATICS, ENTER, EXECUTE, JUMPING, STANDING } from "../constants/AnimationComponentConstants.js";
import { POSITION, RIGIDBODY, STATE } from "../constants/ComponentConstants.js";
import { PIXELS_PER_METER } from "../index.js";
import { JumpingState } from "../states/MegamanStates.js";
import { CreatePositionComponent, CreateSpriteComponent, CreateCollisionComponent, CreateRigidbodyComponent, CreateSpyCopterAnimationComponent } from "../utilities/CreateComponents.js";


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
            shootSpyCopter: false
        }
    };

    enter = () => {
        const { registry } = this.player;



        const PATH = `./assets/Background`;

        // Inner Pillar
        let p = CreatePositionComponent(1500, 1012, 200, 2000);
        const innerPillarSprite = CreateSpriteComponent(`${PATH}/entrance-inner-pillar.png`, undefined, "background");
        registry.createEntity([p, innerPillarSprite])

        // sky 1 & 2 & 3
        p = CreatePositionComponent(-2, 1000, 1000, 1005);
        const skySprite = CreateSpriteComponent(`${PATH}/sky.png`, undefined, "background");
        registry.createEntity([p, skySprite]);

        p = CreatePositionComponent(980, 0, 1000, 1005);
        registry.createEntity([p, skySprite])

        p = CreatePositionComponent(-2, 0, 1000, 1005);
        registry.createEntity([p, skySprite])

        p = CreatePositionComponent(980, 1000, 1000, 1005);
        registry.createEntity([p, skySprite])



        // Background bridge position
        p = CreatePositionComponent(0, 2000, 1000, 1000);
        const backgroundBridgeSprite = CreateSpriteComponent(`${PATH}/background-bridge.png`, undefined, "background");
        registry.createEntity([p, backgroundBridgeSprite])


        // background
        p = CreatePositionComponent(0, 2000, 2000, 1000)
        const cityScapeSprite = CreateSpriteComponent(`${PATH}/city-scape-background.png`, undefined, "background")
        registry.createEntity([p, cityScapeSprite])


        // Entrance Bridge
        p = CreatePositionComponent(0, 3000, 1800, 250)
        const bridgeSprite = CreateSpriteComponent(`${PATH}/bridge.png`, undefined, "background")
        let c = CreateCollisionComponent();
        registry.createEntity([c, bridgeSprite, p])



        // Outer Pillar 
        p = CreatePositionComponent(1700, 2050, 200, 1225);
        const outerPillarSprite = CreateSpriteComponent(`${PATH}/entrance-outer-pillar.png`);
        registry.createEntity([p, outerPillarSprite])

        // Clouds
        // cloud 1
        p = CreatePositionComponent(10, 0, 1000, 1005);
        const r = CreateRigidbodyComponent(-500, undefined, undefined, undefined, undefined, undefined);
        const cloudSprite = CreateSpriteComponent(`${PATH}/clouds.png`, undefined);
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
                let s = CreateSpriteComponent();
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
            let p = CreatePositionComponent(-1500, 350, 1100, 500);
            let r = CreateRigidbodyComponent(500, undefined, undefined, undefined, undefined, undefined);
            let s = CreateSpriteComponent();
            let a = CreateSpyCopterAnimationComponent()
            const s1 = registry.createEntity([p, r, s, a])
            this.finalSpyCopter = s1;

            this.events.finalSpyCopter = true;

        }

        // hold position of spy copter and make x and zero do animations
        if (this.finalSpyCopter) {

            const p = Registry.getComponent(POSITION, this.finalSpyCopter.id);
            const r = Registry.getComponent(RIGIDBODY, this.finalSpyCopter.id);

            if (p.x >= 300) r.velocity.x = 0;

            const playerPosition = Registry.getComponent(POSITION, this.player.id);
            const playerRigidBody = Registry.getComponent(RIGIDBODY, this.player.id);

            const playerState = Registry.getComponent(STATE, this.player.id);

            // when copter in positin place x in position, change state to jump state
            if (p.x > 270 && playerState.currentState.name === STANDING && this.events.jumpOnSpyCopter === false) {

                playerPosition.x = 700
                playerPosition.y = 1000;
                this.eventBus[this.player.id][CHANGESTATE](new JumpingState(0), this.player.id)
                playerRigidBody.velocity.y = 0;
                this.events.jumpOnSpyCopter = true;
                console.log("HERE 0")
            }

            // Now move X up 
            if (this.events.jumpOnSpyCopter === true && this.events.fallOnSpyCopter === false) {
                console.log("Here1 :", playerPosition, playerRigidBody)
                playerRigidBody.velocity.y = -600;
                if (playerPosition.y <= 475) {
                    this.events.fallOnSpyCopter = true;
                }
            }

            // Now onto copter
            if (this.events.fallOnSpyCopter === true && this.events.shootSpyCopter === false) {
                console.log("Here2")

                playerRigidBody.sumForces.y = playerRigidBody.mass * 35 * PIXELS_PER_METER;
                if (playerPosition.y >= 480) {
                    this.events.shootSpyCopter = true;
                    playerRigidBody.sumForces.y = 0;
                    playerRigidBody.acceleration.y = 0;
                    playerRigidBody.velocity.y = 0;
                }
            }

        }






    }

    exit = () => { };
}


export default IntroCinematic




