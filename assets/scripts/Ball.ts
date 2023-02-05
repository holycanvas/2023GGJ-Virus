import { _decorator, Component, RigidBody, Enum, Vec3, math, Collider, ICollisionEvent, js, Animation, Prefab, instantiate } from 'cc';
import { AudioController } from './AudioController';
import { LevelManager } from './LevelManager';
const { ccclass, property, requireComponent, type } = _decorator;
export enum BallType {
    normal,
    cured,
    defender,
    virus
}


@ccclass('Ball')
@requireComponent(RigidBody)
@requireComponent(Collider)
export class Ball extends Component {
    static balls: Ball[] = [];
    protected _velocity = new Vec3();

    protected _speed: Vec3 = new Vec3();
    @property(Animation)
    public animation?: Animation;
    @property(Animation)
    motionStreakAnimation: Animation;
    @property(Prefab)
    smog: Prefab;
    @property
    _ballType: BallType = BallType.normal;
    public isPlayingMotionStreak = false;
    @property({ type: Enum(BallType) })
    set ballType(value: BallType) {
        if (this._ballType !== value) {
            this._ballType = value;
            if (value === BallType.virus) {
                this.animation?.play('infectingCell');
                this.animation?.once(Animation.EventType.FINISHED, () => {
                    this.animation?.play('infectedCell');
                })
            } else if (value === BallType.cured) {
                this.animation?.play('curedCell');
            }
        }
    };
    get ballType() {
        return this._ballType;
    }
    public _rigidBody!: RigidBody;
    protected _collider!: Collider;
    start() {
        Ball.balls.push(this);
        this.animation = this.getComponent(Animation);
        this._rigidBody = this.getComponent(RigidBody);
        this._collider = this.getComponent(Collider);
        this._collider.on('onCollisionEnter', this.onCollisionEnter, this)
        this._collider.on('onCollisionStay', this.onCollisionStay, this)
        this._collider.on('onCollisionExit', this.onCollisionExit, this)
    }
    playSmog(position: Vec3) {
        // the position in is the world position
        let node = instantiate(this.smog);
        LevelManager.instance.normalCellContainer.addChild(node);
        node.setPosition(position);
        let animation = node.getComponent(Animation);
        animation.once(Animation.EventType.FINISHED, () => {
            node.destroy();
        })
        animation.play('smog');
        AudioController.instance.playCollide();
    }
    onCollisionEnter(event: ICollisionEvent) {
        const otherBall = event.otherCollider.getComponent(Ball);
        if (!otherBall) {
            return;
        }
        if (this.ballType === BallType.virus && otherBall.ballType === BallType.normal) {
            otherBall.ballType = BallType.virus;
            LevelManager.instance.springManager.add(this._rigidBody, otherBall._rigidBody);
            let collisionPoint = new Vec3();
            collisionPoint.add(this.node.worldPosition)
                .add(otherBall.node.worldPosition)
                .divide3f(2, 2, 2);
            this.playSmog(collisionPoint);
            LevelManager.instance.virus.touchFlag = true;
            LevelManager.instance.affectedNum++;

        } else if (this.ballType === BallType.defender && otherBall.ballType === BallType.virus) {
            otherBall.ballType = BallType.cured;
            otherBall._rigidBody.setGroup(1 << 5);
            LevelManager.instance.springManager.remove(otherBall.node)
            if (LevelManager.instance.affectedNum > 0)
                LevelManager.instance.affectedNum--;
        } else if (this.ballType === BallType.virus && otherBall.ballType === BallType.virus) {
            LevelManager.instance.springManager.add(this._rigidBody, otherBall._rigidBody);
        }

    }
    onCollisionStay(event: ICollisionEvent) {

    }
    onCollisionExit(event: ICollisionEvent) {

    }
    update(deltaTime: number) {
        this._rigidBody.getLinearVelocity(this._velocity);
        if(this.motionStreakAnimation){
            this.motionStreakAnimation.node.eulerAngles = new Vec3(this.node.eulerAngles.x, this.node.eulerAngles.y, Math.atan2(this._velocity.y, this._velocity.x) * (180 / Math.PI));
        }
    }
}