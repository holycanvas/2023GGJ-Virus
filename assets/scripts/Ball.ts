import { _decorator, Component, RigidBody, Enum,Vec3, math, Collider, ICollisionEvent } from 'cc';
const { ccclass, property, requireComponent,type } = _decorator;
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
    
    @type(Enum(BallType))
    ballType: BallType = BallType.normal;
    protected _rigidBody!:RigidBody;
    protected _collider!:Collider;
    start() {
        Ball.balls.push(this);
        this._rigidBody = this.getComponent(RigidBody);
        this._collider = this.getComponent(Collider);
        this._collider.on('onCollisionEnter',this.onCollisionEnter,this)
        this._collider.on('onCollisionStay',this.onCollisionStay,this)
        this._collider.on('onCollisionExit',this.onCollisionExit,this)
    }
    onCollisionEnter(event: ICollisionEvent){
        const otherBall = event.otherCollider.getComponent(Ball);
        if(!otherBall) {
            return;
        }
        if(this.ballType === BallType.virus && otherBall.ballType === BallType.normal) {
            otherBall.ballType = BallType.virus;
        } else if(this.ballType === BallType.defender && otherBall.ballType === BallType.virus){
            otherBall.ballType = BallType.cured;
        }

    }
    onCollisionStay(event: ICollisionEvent){

    }
    onCollisionExit(event: ICollisionEvent){

    }
    update(deltaTime: number) {

    }
}


