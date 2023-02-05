import { _decorator, Component, Node } from 'cc';
import { Ball } from './Ball';
const { ccclass, property } = _decorator;

@ccclass('Virus')
export class Virus extends Ball {
    start() {
        this._isConnectedToVirus = true;
    }

    update(deltaTime: number) {
        
    }
}

