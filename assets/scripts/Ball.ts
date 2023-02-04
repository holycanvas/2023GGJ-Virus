import { _decorator, Component, RigidBody, Enum, Vec3, math, Collider, ICollisionEvent, js, Animation, Prefab, instantiate } from 'cc';
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
    protected _speed: Vec3 = new Vec3();
    @property(Animation)
    public animation?: Animation;
    @property(Prefab)
    smog:Prefab;
    @property
    _ballType: BallType = BallType.normal;
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
                this.animation?.play('swallower');
                this.animation?.once(Animation.EventType.FINISHED, () => {
                    this.animation?.play('curedCell');
                })
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
    playSmog(position: Vec3){
        // the position in is the world position
        let node = instantiate(this.smog);
        LevelManager.instance.normalCellContainer.addChild(node);
        node.setPosition(position);
        let animation = node.getComponent(Animation);
        animation.once(Animation.EventType.FINISHED, ()=>{
            console.log('play done');
            node.destroy();
        })
        animation.play('smog');
    }
    onCollisionEnter(event: ICollisionEvent) {
        const otherBall = event.otherCollider.getComponent(Ball);
        if (!otherBall) {
            return;
        }
        if (this.ballType === BallType.virus && otherBall.ballType === BallType.normal) {
            otherBall.ballType = BallType.virus;
            const springs = LevelManager.instance.springManager.springs;
            const length = springs.length;
            springs.length += 2;
            springs[length] = event.otherCollider.getComponent(RigidBody);
            springs[length + 1] = event.selfCollider.getComponent(RigidBody);

            let collisionPoint = new Vec3();
            collisionPoint.add(this.node.worldPosition)
                .add(otherBall.node.worldPosition)
                .divide3f(2,2,2);
            this.playSmog(collisionPoint);

            LevelManager.instance.affectedNum++;

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
            LevelManager.instance.affectedNum--;
        }

    }
    onCollisionStay(event: ICollisionEvent) {

    }
    onCollisionExit(event: ICollisionEvent) {

    }
    update(deltaTime: number) {

    }
}