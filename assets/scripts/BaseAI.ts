import { _decorator, Component, Node, RigidBody, Vec3, math, UITransform, Animation, Sprite } from 'cc';
import { Ball, BallType } from './Ball';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('BaseAI')
export class BaseAI extends Ball {
    protected _speed: Vec3 = new Vec3(math.randomRange(-1, 1), math.randomRange(-1, 1));
    private _uiTransform: UITransform | null = null;
    private _originWidth = 0;
    private _originHeight = 0;

    @property(Animation)
    emotion:Animation|null = null;

    start() {
        super.start();
        this._uiTransform = this.getComponent(UITransform);
        this._originWidth = this._uiTransform.width;
        this._originHeight = this._uiTransform.height;
        this.scheduleOnce(() => {
            if (this._ballType === BallType.normal || this._ballType === BallType.defender) {
                this.animation?.play()   
            }
        }, math.randomRange(0, 10));

        this.scheduleOnce(() => this.emotion?.play(), math.randomRange(0, 10));
    }

    update(deltaTime: number) {
        super.update(deltaTime);
        const length = this._velocity.length();
        if (length > 10) {
            this._uiTransform.width = this._originWidth * (0.5 + 5 / length);
            this._uiTransform.height = this._originHeight * (0.5 + 5 / length);
            if (!this.isPlayingMotionStreak && this.motionStreakAnimation){
                this.motionStreakAnimation.play();
                this.isPlayingMotionStreak = true;
            }

        } else {
            if (this.motionStreakAnimation){
                this.motionStreakAnimation.pause();
                this.motionStreakAnimation.node.getComponent(Sprite).spriteFrame = null;
            }
        }

    }
}


