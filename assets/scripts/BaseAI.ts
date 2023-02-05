import { _decorator, Component, Node, RigidBody, Vec3, math, UITransform, Animation, Sprite } from 'cc';
import { Ball } from './Ball';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('BaseAI')
export class BaseAI extends Ball {
    protected _speed: Vec3 = new Vec3(math.randomRange(-1, 1), math.randomRange(-1, 1));
    private _velocity = new Vec3();
    private _uiTransform: UITransform | null = null;
    private _originWidth = 0;
    private _originHeight = 0;
    private _isPlayingMotionStreak = false;
    @property(Animation)
    motionStreakAnimation:Animation;
    start() {
        super.start();
        this._uiTransform = this.getComponent(UITransform);
        this._originWidth = this._uiTransform.width;
        this._originHeight = this._uiTransform.height;
    }

    update(deltaTime: number) {
        this._rigidBody.getLinearVelocity(this._velocity);
        const length = this._velocity.length();
        if (length > 10) {
            this._uiTransform.width = this._originWidth * (0.5 + 5 / length);
            this._uiTransform.height = this._originHeight * (0.5 + 5 / length);
            if (!this._isPlayingMotionStreak && this.motionStreakAnimation){
                this.motionStreakAnimation.play();
                this._isPlayingMotionStreak = true;
                this.motionStreakAnimation.node.eulerAngles = new Vec3(this.motionStreakAnimation.node.eulerAngles.x, this.motionStreakAnimation.node.eulerAngles.y, Math.atan2(this._velocity.y, this._velocity.x) * (180 / Math.PI));

            }
            

        } else {
            if (this.motionStreakAnimation){
                this.motionStreakAnimation.pause();
                this.motionStreakAnimation.node.getComponent(Sprite).spriteFrame = null;
            }
        }
    }
}


