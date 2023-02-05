import { _decorator, Component, Node, director, Label, Color } from 'cc';
import { Ball } from './Ball';
import { Controller } from './controller';
import { LevelManager } from './LevelManager';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {

    @property([Label])
    public scores: Label[] = [];
    @property(Node)
    public center: Node | null = null;
    public score = 0;
    @property(Label)
    public time: Label;
    private _time = 60;
    @property(Label)
    public word: Label;

    start() {
        this.schedule(()=>{
            this._time--;
            this.time.string = this._time.toString();
            if(this._time<10){
                //时间快结束了，更改Label的颜色。
                this.time.color = Color.RED;
            }
            if(this._time == 0){
                // GAME OVER
                this.timeup();
            }
        } ,1);
    }

    update(deltaTime: number) {
        this.score = LevelManager.instance.affectedNum * 100 / LevelManager.instance.normalCellNum;
        this.scores[0].string = this.score.toString();
        if(!this.center.active){
            this.scores[1].string = this.score.toString();
        }
        
    }

    onRestart() {
        Ball.balls = [];
        director.loadScene('MainScene');
    }
    timeup(){
        if(this.score>60){
            this.word.string = "病毒成功感染了宿主";
            
            //TODO: animtation for a better view
        }
        else {
            this.onDead("很遗憾，你失败了");
        }
    }
    onDead(word:string) {
        this.center.active = true;
        this.unscheduleAllCallbacks();
        Controller.instance.onDead();
        LevelManager.instance.springManager['lines'].forEach(item => item.destroy());
        LevelManager.instance.springManager['lines'] = [];
        this.word.string = word;
    }

}

