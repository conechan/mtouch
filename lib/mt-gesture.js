import MTouch from './mt-touch';
import _ from './utils';

export default class Mgesture {
    constructor(options) {
        this.ops = {
            receiver: null,
            operator: null,
            event: {}
        };
        this.ops = _.extend(this.ops, options);
        if (typeof this.ops.receiver !== 'string' || (typeof this.ops.operator !== 'string' && this.ops.operator !== null)) {
            console.error('请传入receiver,operator的选择器');
            return;
        }

        this.receiver = document.querySelector(this.ops.receiver);
        if(!this.ops.operator){
            this.operator = this.ops.receiver;
            this.delegation = false;
        }else{
            this.operator = this.ops.operator;
            this.delegation = true;
        }

        this.init();
        this.bind();
    };
    init() {};
    bind() {
        let options = {
            receiver: this.receiver,
            operator: this.operator,
            delegation: this.delegation
        };
        options = _.extend(options, this.ops.event);
        console.log(options);
        new MTouch(options);
    };
}
