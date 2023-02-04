import { _decorator, Component, RigidBody, ccenum, Vec3, math } from 'cc';
import { Ball, BallType } from './Ball';
import { BaseAI } from './BaseAI';
import { Controller } from './controller';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('Defender')
export class DefenderAI extends BaseAI {
    /** 用于节省性能的 vec */
    protected static _tempVec = new Vec3();
    protected _time = 0;
    @property
    searchRange = 100;
    @property
    /** 追击的阈值，超过这个阈值将发起一次进攻 */
    chaseThreshold = 100;
    @property
    chaseSpeed = 10;
    protected lastPoint: Vec3 = new Vec3();
    start() {
        super.start();
    }

    update(deltaTime: number) {

        //记录十帧前玩家的位置
        if (Vec3.distance(Controller.instance.node.worldPosition, this.node.worldPosition) <= this.searchRange) {
            if (this._time === 0) {
                this.lastPoint.set(Controller.instance.node.worldPosition);
            }
            this._time++;
        } else {
            const closeBall = Ball.balls.find(item => item.ballType === BallType.virus && Vec3.distance(item.node.worldPosition, this.node.worldPosition) <= this.searchRange)
            if (closeBall) {
                if (this._time === 0) {
                    this.lastPoint.set(closeBall.node.worldPosition);
                }
                this._time++;
            }
        }

        if (this._time > this.chaseThreshold) {
            const value = Vec3.subtract(DefenderAI._tempVec, Controller.instance.node.worldPosition, this.node.worldPosition).normalize().multiplyScalar(this.chaseSpeed * deltaTime);
            this._rigidBody.applyImpulse(value);
            this._time = 0;
        }
        if (this._time > 0) {
            this._time--;
        }

    }
}


