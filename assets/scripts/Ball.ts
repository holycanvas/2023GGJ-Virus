import { _decorator, Component, Node, ccenum } from 'cc';
const { ccclass, property } = _decorator;
export enum BallType {
    normal,
    cured,
    defender,
    player
}
@ccclass('Ball')
export class Ball extends Component {
    static balls: Ball[];
    @property({ type: ccenum(BallType) })
    ballType: BallType = BallType.normal;
    start() {
        Ball.balls.push(this);
    }

    update(deltaTime: number) {

    }
}


