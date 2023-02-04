import { _decorator, Component, Node, director, Label } from 'cc';
import { LevelManager } from './LevelManager';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {

    @property([Label])
    public scores: Label[] = [];
    @property(Node)
    public center: Node | null = null;
    public score = 0;

    private total: number;
    public currentNum: number = 0;
    start() {
        this.total = LevelManager.instance.normalCellNum;
    }

    update(deltaTime: number) {
        this.score = this.currentNum/this.total;
        for (let i = 0; i < this.scores.length; i++) {
            this.scores[i].string = this.score.toString();
        }
    }

    onRestart () {
        director.loadScene('MainScene');
    }

    onDead () {
        this.center.active = true;
    }
}

