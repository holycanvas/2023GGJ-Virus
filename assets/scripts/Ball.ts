import { _decorator, Component, RigidBody, Enum, Vec3, math, Collider, ICollisionEvent, js, Animation } from 'cc';
import { LevelManager } from './LevelManager';
const { ccclass, property, requireComponent, type } = _decorator;
export enum BallType {
    normal,
    cured,
    defender,
    virus
}

const BullTypeToAnimation: Record<BallType, string> = {
    "0": "cell",
    "1": "curedCell",
    "2": "defender",
    "3": "virus"
}
@ccclass('Ball')
@requireComponent(RigidBody)
@requireComponent(Collider)
export class Ball extends Component {
    static balls: Ball[] = [];
    protected _speed: Vec3 = new Vec3();
    @property(Animation)
    public animation: Animation;
    @property
    _ballType: BallType = BallType.normal;
    @property({type:Enum(BallType)})
    set ballType(value: BallType) {
        if (this._ballType !== value) {
            this._ballType = value;
            if (this.animation.clips.some(item=>item.name === BullTypeToAnimation[value])) {
                this.animation.play(BullTypeToAnimation[value]);
            }
        }
    };
    get ballType() {
        return this._ballType;
    }
    protected _rigidBody!: RigidBody;
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
    onCollisionEnter(event: ICollisionEvent) {
        const otherBall = event.otherCollider.getComponent(Ball);
        if (!otherBall) {
            return;
        }
        if (this.ballType === BallType.virus && otherBall.ballType === BallType.normal) {
            otherBall.ballType = BallType.virus;
            otherBall.animation.play()
            const springs = LevelManager.instance.springManager.springs;
            const length = springs.length;
            springs.length += 2;
            springs[length] = event.otherCollider.getComponent(RigidBody);
            springs[length + 1] = event.selfCollider.getComponent(RigidBody);

        } else if (this.ballType === BallType.defender && otherBall.ballType === BallType.virus) {
            otherBall.ballType = BallType.cured;
            const springs = LevelManager.instance.springManager.springs;
            for (let i = springs.length - 1; i >= 0; i -= 2) {
                const rigidBodyA = springs[i];
                const rigidBodyB = springs[i - 1];
                if (rigidBodyA.node === otherBall.node || rigidBodyB.node === otherBall.node) {
                    js.array.fastRemoveAt(springs, i);
                    js.array.fastRemoveAt(springs, i - 1);
                }
            }
        }

    }
    onCollisionStay(event: ICollisionEvent) {

    }
    onCollisionExit(event: ICollisionEvent) {

    }
    update(deltaTime: number) {

    }
}