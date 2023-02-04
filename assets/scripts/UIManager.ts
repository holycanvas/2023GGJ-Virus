import { _decorator, Component, Node, director, Label } from 'cc';
import { Ball } from './Ball';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {

    @property([Label])
    public scores: Label[] = [];
    @property(Node)
    public center: Node | null = null;
    public score = 0;

    start() {

    }

    update(deltaTime: number) {
        for (let i = 0; i < this.scores.length; i++) {
            this.scores[i].string = this.score.toString();
        }
    }

    onRestart() {
        Ball.balls = [];
        director.loadScene('MainScene');
    }

    onDead() {
        this.center.active = true;
    }
}

