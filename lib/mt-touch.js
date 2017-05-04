import _ from './utils';
import HandlerBus from './handlerBus';

window.requestAnimFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();

const EVENT = [
    'touchstart',
    'touchmove',
    'touchend',
    'drag',
    'dragstart',
    'dragend',
    'pinch',
    'pinchstart',
    'pinchend',
    'rotate',
    'rotatestart',
    'rotatend',
    'singlePinch',
    'singlePinchstart',
    'singlePinchend',
    'singleRotate',
    'singleRotatestart',
    'singleRotatend'
];
export default class MTouch {
    constructor(options) {
        this.ops = {
            // config:
            receiver: null,
            operator: null,
            delegation: false,
            limit: null,

            transform: {
                x: 0,
                y: 0,
                scale: 1,
                rotate: 0
            },

            // event
            touchstart() {},
            touchmove() {},
            touchend() {},

            drag() {},
            dragstart() {},
            dragend() {},

            pinch() {},
            pinchstart() {},
            pinchend() {},

            rotate() {},
            rotatestart() {},
            rotatene() {},

            singlePinch() {},
            singlePinchstart() {},
            singlePinchend() {},
            singlePinchId: null,

            singleRotate() {},
            singleRotatestart() {},
            singleRotatend() {},
            singleRotateId: null
        };
        this.ops = _.extend(this.ops, options);

        this.transform = this.ops.transform;

        // 开关；
        this.use = {
            drag: !!options.drag,
            pinch: !!options.pinch,
            rotate: !!options.rotate,
            singlePinch: !!options.singlePinch && !!options.singlePinchId,
            singleRotate: !!options.singleRotate && !!options.singleRotateId
        }

        // 事件接收器；
        this.receiver = typeof this.ops.receiver == 'string'
            ? document.querySelector(this.ops.receiver)
            : this.ops.receiver;
        // 获取接收器的状态；
        this.receiverStatus = this.receiver.getBoundingClientRect();

        // 事件操纵器；
        if (this.ops.operator) {
            this.ops.delegation = true;
            this.operator = document.querySelector(this.ops.operator);
            this.operatorStatus = this.operator.getBoundingClientRect();
        } else {
            this.ops.delegation = false;
            this.operator = this.receiver;
            this.operatorStatus = this.receiverStatus;
        }

        // 事件对象包装；
        this.event = {
            origin: null,
            transform: this.transform,
            eventType: '',
            delta: {},
            setTransform: this.setTransform.bind(this)
        }

        // touch状态；
        this.fingers = 0;
        // 初始状态;
        this.draging = this.pinching = this.rotating = this.singleRotating = this.singlePinching = false;

        this.startScale = 1;
        this.startPoint = {};
        this.secondPoint = {};
        this.pinchStartLength = null;
        this.singlePinchStartLength = null;
        this.vertor1 = {};
        this.singleBasePoint = {};
        // eventbus
        this.driveBus();
        this.bind();
    };
    driveBus() {
        let fn = () => {};
        EVENT.forEach(eventName => {
            this[eventName] = new HandlerBus(this.receiver).add(this.ops[eventName] || fn);
        });
    };
    bind() {
        ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach(evName => {
            let fn = evName == 'touchcancel'
                ? 'end'
                : evName.replace('touch', '');
            this.receiver.addEventListener(evName, this[fn].bind(this), false);
        });
    };
    start(ev) {
        if (!ev.touches || ev.type !== 'touchstart')
            return;
        this.fingers = ev.touches.length;
        this.startPoint = _.getPoint(ev, 0);
        this.singleBasePoint = _.getBasePoint(this.operator);
        this.transform = _.getPos(this.operator);

        if (this.fingers > 1) {
            this.secondPoint = _.getPoint(ev, 1);
            this.vertor1 = _.getVertor(this.secondPoint, this.startPoint);
            this.pinchStartLength = _.getLength(this.vertor1);
        } else if (this.use.singlePinch) {
            let pinchV1 = _.getVertor(this.startPoint, this.singleBasePoint);
            this.singlePinchStartLength = _.getLength(pinchV1);
        }

        this.event.origin = ev;
        this.event.eventType = 'touchstart';
        this.touchstart.fire(this.event);
    };
    move(ev) {
        if (!ev.touches || ev.type !== 'touchmove')
            return;

        let curPoint = _.getPoint(ev, 0);
        let curFingers = ev.touches.length;
        let rotateV1,
            rotateV2,
            pinchV2,
            pinchLength,
            singlePinchLength;

        this.event.origin = ev;

        // 当从原先的两指到一指的时候，可能会出现基础手指的变化，导致跳动；
        // 因此需屏蔽掉一次错误的touchmove事件，待重新设置基础指后，再继续进行；
        if (curFingers < this.fingers) {
            this.startPoint = curPoint;
            this.fingers = curFingers;
            return;
        }

        // 两指先后触摸时，只会触发第一指一次touchstart，第二指不会再次触发touchstart；
        // 因此会出现没有记录第二指状态，需要在touchmove中重新获取参数；
        if (curFingers > 1 && (!this.secondPoint || !this.vertor1 || !this.pinchStartLength)) {
            this.secondPoint = _.getPoint(ev, 1);
            this.vertor1 = _.getVertor(this.secondPoint, this.startPoint);
            this.pinchStartLength = _.getLength(this.vertor1);
        };

        // 双指时，需触发pinch和rotate事件；
        if (curFingers > 1) {
            let curSecPoint = _.getPoint(ev, 1);
            let vertor2 = _.getVertor(curSecPoint, curPoint);
            // pinch
            if (this.use.pinch) {
                pinchLength = _.getLength(vertor2);
                this.event.delta = {
                    scale: pinchLength / this.pinchStartLength
                };
                this.transform.scale *= this.event.delta.scale;
                this.event.transform = this.transform;
                this.pinchStartLength = pinchLength;
                this.eventFire('pinch', this.event);
            }
            // rotate
            if (this.use.rotate) {
                this.event.delta = {
                    rotate: _.getAngle(this.vertor1, vertor2)
                };
                this.transform.rotate += this.event.delta.rotate;
                this.event.transform = this.transform;
                this.vertor1 = vertor2;
                this.eventFire('rotate', this.event);
            }
        } else {
            // singlePinch;
            if (this.use.singlePinch && ev.target.id == this.ops.singlePinchId) {
                pinchV2 = _.getVertor(curPoint, this.singleBasePoint);
                singlePinchLength = _.getLength(pinchV2);
                this.event.delta = {
                    scale: singlePinchLength / this.singlePinchStartLength
                };
                this.transform.scale *= this.event.delta.scale;
                this.event.transform = this.transform;
                this.singlePinchStartLength = singlePinchLength;
                this.eventFire('singlePinch', this.event);
            }
            // singleRotate;
            if (this.use.singleRotate && ev.target.id == this.ops.singleRotateId) {
                rotateV1 = _.getVertor(this.startPoint, this.singleBasePoint);
                rotateV2 = _.getVertor(curPoint, this.singleBasePoint);
                this.event.delta = {
                    rotate: _.getAngle(rotateV1, rotateV2)
                };
                this.transform.rotate += this.event.delta.rotate;
                this.event.transform = this.transform;
                this.eventFire('singleRotate', this.event);
            }
        }
        if (this.use.drag) {
            if (ev.target.id !== this.ops.singlePinchId && ev.target.id !== this.ops.singleRotateId) {
                this.event.delta = {
                    deltaX: curPoint.x - this.startPoint.x,
                    deltaY: curPoint.y - this.startPoint.y
                }
                this.transform.x += this.event.delta.deltaX;
                this.transform.y += this.event.delta.deltaY;
                this.event.transform = this.transform;
                this.eventFire('drag', this.event);
            }
        }
        this.startPoint = curPoint;

        this.event.eventType = 'touchmove';
        this.touchmove.fire(this.event);
        ev.preventDefault();
    };
    end(ev) {
        if (!ev.touches && ev.type !== 'touchend' && ev.type !== 'touchcancel')
            return;

        this.event.origin = ev;
        ['pinch', 'drag', 'rotate', 'singleRotate', 'singlePinch'].forEach(evName => {
            this.eventEnd(evName, this.event);
        });
        this.event.eventType = 'touchend';
        this.touchend.fire(this.event);
    };
    eventFire(evName, ev) {
        let ing = `${evName}ing`;
        let start = `${evName}start`;
        if (!this[ing]) {
            ev.eventType = start;
            this[start].fire(ev);
            this[ing] = true;
        } else {
            ev.eventType = evName;
            this[evName].fire(ev);
        }
    };
    eventEnd(evName, ev) {
        let ing = `${evName}ing`;
        let end;
        if (evName == 'rotate' || evName == 'singleRotate') {
            end = `${evName}nd`;
        } else {
            end = `${evName}end`;
        }
        if (this[ing]) {
            ev.eventType = end;
            this[end].fire(ev);
            this[ing] = false;
        }
    };
    setTransform(el = this.operator, transform = this.transform) {
        let trans = JSON.parse(JSON.stringify(transform));
        if (this.ops.limit && this.ops.delegation && this.event.eventType == 'drag') {
            trans = this.limitOperator(trans);
        }
        _.setPos(el, this.limitOperator(trans));
    };
    limitOperator(transform) {
        // 实时获取操作元素的状态；
        let operatorStatus = this.operator.getBoundingClientRect();
        // 因缩放产生的间隔；
        let spaceX = this.operatorStatus.width * (transform.scale - 1) / 2;
        let spaceY = this.operatorStatus.height * (transform.scale - 1) / 2;
        // 参数设置的边界值；
        let boundaryX = operatorStatus.width * (this.ops.limit.x);
        let boundaryY = operatorStatus.height * (this.ops.limit.y);
        // 4个边界状态；
        let minX = spaceX - boundaryX;
        let minY = spaceY - boundaryY;
        let maxX = this.receiverStatus.width - operatorStatus.width + spaceX + boundaryX;
        let maxY = this.receiverStatus.height - operatorStatus.height + spaceY + boundaryY;
        let {minScale, maxScale} = this.ops.limit;

        if(this.ops.limit.x || this.ops.limit.x == 0){
            if(transform.x >= maxX)transform.x = maxX;
            if(transform.x < minX)transform.x = minX;
        }
        if(this.ops.limit.y || this.ops.limit.y == 0){
            if(transform.y > maxY)transform.y = maxY;
            if(transform.y < minY)transform.y = minY;
        }

        if (this.ops.limit.minScale && transform.scale < minScale)
            transform.scale = minScale;
        if (this.ops.limit.maxScale && transform.scale > maxScale)
            transform.scale = maxScale;
        return transform;
    };
    switchOperator(el) {
        this.operator = el;
    };
    on(evName, handler) {
        this[evName] && this[evName].add(handler);
    };
    off(evName, handler) {
        this[evName] && this[evName].del(handler);
    };
}

if (!window.MTPlugin) {
    window.MTPlugin = {};
};
window.MTPlugin.Mtouch = MTouch;
