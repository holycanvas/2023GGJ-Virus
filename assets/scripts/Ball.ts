import { _decorator, Component, RigidBody, Enum,Vec3, math } from 'cc';
const { ccclass, property, requireComponent,type } = _decorator;
export enum BallType {
    normal,
    cured,
    defender,
    player
}
@ccclass('Ball')
@requireComponent(RigidBody)
export class Ball extends Component {
    static balls: Ball[] = [];
    protected _speed: Vec3 = new Vec3();
    
    @type(Enum(BallType))
    ballType: BallType = BallType.normal;
    _rigidBody!:RigidBody;
    start() {
        Ball.balls.push(this);
        this._rigidBody = this.getComponent(RigidBody);
    }

    update(deltaTime: number) {

    }
}


