import { _decorator, Component, Node, input, Input, EventKeyboard, KeyCode, geometry, Vec3, Vec2, Sprite, RigidBody, CCFloat, EventMouse, Camera, find, Collider, ITriggerEvent, Vec4, Animation, ConeCollider, PhysicsRayResult, physics, Prefab, instantiate, Quat } from 'cc';
import { AudioController } from './AudioController';
import { Ball, BallType } from './Ball';
import { Bonus, BonusType } from './Bonus';
import { LevelManager } from './LevelManager';
const { ccclass, property } = _decorator;

@ccclass('Controller')
export class Controller extends Component {
    private direction = new Vec3();
    private speed = 15;
    private rigidBody: RigidBody | null = null;
    private mainCamera: Camera | null = null;
    private operationDirection = new Vec3();
    private _isOperationPull: boolean = false;
    private currentAnimation: Animation;
    private set isOperationPull(value: boolean) {
        if (this._isOperating) {
            return;
        }
        this._isOperationPull = value;
        if (value) {
            this.currentAnimation = this.absorbAnimation;
        } else {
            this.currentAnimation = this.launchAnimation;
        }
    };
    private get isOperationPull() {
        return this._isOperationPull;
    }
    private mousePosition = new Vec3;
    private collider: Collider | null = null;
    @property({ type: CCFloat, slide: true, range: [0, 50] })
    public operationRadius = 30;
    @property({ type: CCFloat, slide: true, range: [0, 180] })
    public operationTheta = 60;
    @property(Node)
    public indicator: Node | null = null;
    public operationStrength = 100;
    private _isOperating: boolean = false;
    public set isOperating(value: boolean) {
        if (this._isOperating === value) {
            return;
        }
        this._isOperating = value;
        if (!this.currentAnimation) {
            return;
        }
        if (value && this._ball._ballType === BallType.virus) {
            this.currentAnimation.play();
            if (this._isOperationPull) {
                AudioController.instance.playAbsorb();
            }
        } else {
            AudioController.instance.stopAbsorb();
            this.launchAnimation.pause();
            this.launchAnimation.getComponent(Sprite)!.spriteFrame = null;
            this.absorbAnimation.pause();
            this.absorbAnimation.getComponent(Sprite)!.spriteFrame = null;
        }
    };
    public touchFlag: boolean = false;
    public get isOperating() { return this._isOperating }
    @property(Animation)
    public launchAnimation: Animation | null = null;
    @property(Animation)
    public absorbAnimation: Animation | null = null;
    @property(Animation)
    public idleAnimation: Animation | null = null;

    @property(CCFloat)
    public pushStrength = 5;
    @property(CCFloat)
    public pushLength = 5;
    @property(CCFloat)
    public pushInterval = 0.2;
    private _moveState = new Vec4();
    private _ball: Ball | null = null;
    private _accumulateTime = 0;
    @property(Prefab)
    public particleSystem: Prefab | null = null;
    
    public static instance:Controller;
    public attackBonusTime = 0;
    public speedBonusTime = 0;
    public invincibleBonusTime = 0;
    private _originStrength = 0;
    private _originSpeed = 0;
    public get isDead():boolean {
        return this._ball._ballType !== BallType.virus;
    };
    onLoad() {
        Controller.instance = this;
        this._ball = this.getComponent(Ball);
    }

    start() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        this.rigidBody = this.getComponent(RigidBody);
        this.mainCamera = find('Main Camera').getComponent(Camera);
        this.collider = this.indicator.getComponentInChildren(ConeCollider);
        this.collider.on('onTriggerStay', this.onOperation, this);
        this._originStrength = this.pushStrength;
        this._originSpeed = this.speed;
    }
    onDead() {
        this.isOperating = false;
        this.idleAnimation?.pause();
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
        input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        this.getComponent(Sprite).grayscale = true;
    }

    onWin () {
        this.isOperating = false;
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
        input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }

    addBonus (type: BonusType) {
        if (type === BonusType.SPEED) {
            this.speedBonusTime = 8;
        } else if (type === BonusType.POWER) {
            this.attackBonusTime = 8;
        } else {
            this.invincibleBonusTime = 8;
        }
    }

    update(deltaTime: number) {
        if (this._ball.ballType === BallType.cured) {
            LevelManager.instance.uiManager.onDead("The root cause of the virus was eliminated");

            return;
        }
        this.attackBonusTime -= deltaTime;
        this.speedBonusTime -= deltaTime;
        this.invincibleBonusTime -= deltaTime;

        if (this.speedBonusTime > 0) {
            this.speed = 3 * this._originSpeed;
            if(!this._ball.isPlayingMotionStreak){
                this._ball.isPlayingMotionStreak = true;
                this._ball.motionStreakAnimation?.play();
            }
        } else {
            this.speed = this._originSpeed;
            this._ball.motionStreakAnimation?.pause();
            this._ball.motionStreakAnimation.getComponent(Sprite).spriteFrame = null;
            this._ball.isPlayingMotionStreak = false;
        }

        if (this.invincibleBonusTime > 0) {
            this._ball._rigidBody.setGroup(1 << 6);
        } else {
            this._ball._rigidBody.setGroup(1 << 1);
        }
        this.mainCamera.screenToWorld(this.mousePosition, this.operationDirection);
        this.operationDirection.subtract(this.node.worldPosition);
        this.operationDirection.z = 0;
        this.operationDirection.normalize();
        if (this._isOperating && this._isOperationPull) {
            this._ball._rigidBody.mass = 10;
            this.rigidBody.applyImpulse(Vec3.multiplyScalar(new Vec3(), this.operationDirection, 1.5));
        } else {
            this._ball._rigidBody.mass = 1;
        }
        this.node.eulerAngles = new Vec3(this.indicator.eulerAngles.x, this.indicator.eulerAngles.y, Math.atan2(this.operationDirection.y, this.operationDirection.x) *
            (180 / Math.PI));
        this.direction.y = this._moveState.x + this._moveState.y;
        this.direction.x = this._moveState.z + this._moveState.w;
        if (!this.direction.equals(Vec3.ZERO)) {
            this.rigidBody.applyImpulse(Vec3.multiplyScalar(new Vec3(), this.direction.normalize(), this.speed * deltaTime));
        }
        this._accumulateTime += deltaTime;
        if (this.isOperating && !this.isOperationPull && this._accumulateTime > this.pushInterval) {
            if (this.attackBonusTime > 0) {
                for (let i = 0; i < 3; i++) {
                    const rot = Quat.fromAngleZ(new Quat, -15 + i * 15);
                    const dir = Vec3.transformQuat(new Vec3, this.operationDirection, rot);
                    const ray = new geometry.Ray(this.node.worldPosition.x, this.node.worldPosition.y, this.node.worldPosition.z,
                        dir.x, dir.y, dir.z);
                    if (physics.PhysicsSystem.instance.raycast(ray, 1 << 0, this.pushLength)) {
                        const result = physics.PhysicsSystem.instance.raycastResults;
                        for (let i = 0; i < result.length; i++) {
                            const target = result[i];
                            const ball = target.collider.getComponent(Ball);
                            if (ball && ball.ballType === BallType.virus) {
                                ball._rigidBody.applyImpulse(Vec3.multiplyScalar(new Vec3(), ray.d, this.pushStrength));
                            }
                        }
                    }
                    const node = instantiate(this.particleSystem);
                    this.node.addChild(node);
                    node.eulerAngles = new Vec3(node.eulerAngles.x, node.eulerAngles.y, -15 + i * 15)
                    AudioController.instance.playShoot();
                }
            } else {
                const ray = new geometry.Ray(this.node.worldPosition.x, this.node.worldPosition.y, this.node.worldPosition.z,
                    this.operationDirection.x, this.operationDirection.y, this.operationDirection.z);
                if (physics.PhysicsSystem.instance.raycast(ray, 1 << 0, this.pushLength)) {
                    const result = physics.PhysicsSystem.instance.raycastResults;
                    for (let i = 0; i < result.length; i++) {
                        const target = result[i];
                        const ball = target.collider.getComponent(Ball);
                        if (ball && ball.ballType === BallType.virus) {
                            ball._rigidBody.applyImpulse(Vec3.multiplyScalar(new Vec3(), this.operationDirection, this.pushStrength));
                        }
                    }
                }
                const node = instantiate(this.particleSystem);
                this.node.addChild(node);
                AudioController.instance.playShoot();
            }
            
            this._accumulateTime = 0;
            
        }
    }

    onKeyDown(event: EventKeyboard) {
        if (event.keyCode === KeyCode.KEY_W) {
            this._moveState.x = 1;
        } else if (event.keyCode === KeyCode.KEY_S) {
            this._moveState.y = -1;
        } else if (event.keyCode === KeyCode.KEY_A) {
            this._moveState.z = -1;
        } else if (event.keyCode === KeyCode.KEY_D) {
            this._moveState.w = 1;
        } else if (event.keyCode === KeyCode.KEY_Q) {
            this.isOperationPull = true;
            this.isOperating = true;
        } else if (event.keyCode === KeyCode.KEY_E) {
            this.isOperationPull = false;
            this.isOperating = true;
        }
    }

    onKeyUp(event: EventKeyboard) {
        if (event.keyCode === KeyCode.KEY_W) {
            this._moveState.x = 0;
        } else if (event.keyCode === KeyCode.KEY_S) {
            this._moveState.y = 0;
        } else if (event.keyCode === KeyCode.KEY_A) {
            this._moveState.z = 0;
        } else if (event.keyCode === KeyCode.KEY_D) {
            this._moveState.w = 0;
        } else if (event.keyCode === KeyCode.KEY_Q && this._isOperationPull) {
            this.isOperating = false;
        } else if (event.keyCode === KeyCode.KEY_E && !this._isOperationPull) {
            this.isOperating = false;
        }
    }

    onMouseDown(event: EventMouse) {
        if (event.getButton() === EventMouse.BUTTON_LEFT) {
            this.isOperationPull = true;
        } else if (event.getButton() === EventMouse.BUTTON_RIGHT) {
            this.isOperationPull = false;
        }
        this.isOperating = true;
    }

    onMouseUp(event: EventMouse) {
        if (event.getButton() === EventMouse.BUTTON_LEFT && this._isOperationPull) {
            this.isOperating = false;
        } else if (event.getButton() === EventMouse.BUTTON_RIGHT && !this._isOperationPull) {
            this.isOperating = false;
        }
    }

    onOperation(event: ITriggerEvent) {
        if (!this.isOperating) return;
        const direction = new Vec3();
        if (this.isOperationPull) {
            Vec3.subtract(direction, this.node.worldPosition, event.otherCollider.node.worldPosition);
            direction.z = 0;
            const length = Math.max(direction.length(), 1);
            direction.normalize();
            event.otherCollider.getComponent(RigidBody).applyForce(direction.multiplyScalar(this.operationStrength / length));
            AudioController.instance.playAbsorb();
        }
    }

    onMouseMove(event: EventMouse) {
        event.getLocation(this.mousePosition as unknown as Vec2);
    }
}

