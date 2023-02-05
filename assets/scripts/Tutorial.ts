import { _decorator, Component, Node, Label } from 'cc';
import { Controller } from './controller';
import { LevelManager } from './LevelManager';
const { ccclass, property } = _decorator;
enum STEP{
    MOVE,
    ABSORBE,
    PULL,
    DEFENDER,
}
@ccclass('Tutorial')
export class Tutorial extends Component {
    @property(Label)
    indicator: Label;
    @property(Controller)
    virus: Controller;
    public moveTutorial:string = "使用WASD移动并触碰黑色细胞";
    public absorbTutorial:string = "使用鼠标左键吸收细胞";
    public pullTutorial: string="使用鼠标右键发射细胞";
    public defenderTutorial: string="防御细胞会净化细胞，被净化的细胞将不会被碰撞和吸收";
    step:STEP = STEP.MOVE;
    start() {
        this.indicator.string = this.moveTutorial;
    }
    checkStep1(){
        if(this.virus.touchFlag){
            //可以到下一步
            this.indicator.string = this.absorbTutorial;
            for(let i = 0;i<4;i++){
                LevelManager.instance.generateNormalCell();
            }
            
        }
    }
    checkStep2(){
        if(this.virus.touchFlag){
            //可以到下一步
            this.indicator.string = this.absorbTutorial;
            for(let i = 0;i<4;i++){
                LevelManager.instance.generateNormalCell();
            }
            
        }
    }
    update(deltaTime: number) {
        if(this.step = STEP.MOVE){
            this.checkStep1();
        }
    }
}

