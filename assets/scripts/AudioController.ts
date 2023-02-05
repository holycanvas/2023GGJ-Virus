import { _decorator, Component, Node, AudioClip, AudioSource } from 'cc';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('AudioController')
@requireComponent(AudioSource)
export class AudioController extends Component {
    @property(AudioClip)
    public shoot: AudioClip;
    @property(AudioClip)
    public absorb: AudioClip;
    @property(AudioClip)
    public collide: AudioClip;
    static instance: AudioController;
    private audioSource: AudioSource;
    start() {
        this.audioSource = this.getComponent(AudioSource);
        AudioController.instance = this;
    }
    playShoot(){
        this.audioSource.playOneShot(this.shoot);
    }
    playAbsorb(){
        this.audioSource.loop = true;
        this.audioSource.play();
    }
    stopAbsorb(){
        this.audioSource.stop();
    }
    playCollide(){
        this.audioSource.playOneShot(this.collide);
    }

    update(deltaTime: number) {
        
    }
}

