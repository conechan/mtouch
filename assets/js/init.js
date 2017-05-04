import 'url-loader?name=[path][name].[ext]!../images/pinch.png';
import '../css/main.scss';
import MTouch from '../../lib/mt-touch';


window.requestAnimFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();

let el = document.querySelector('.js-el');
let par = document.querySelector('.js-par');

let transform = {
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0
};

let mtouch = new MTouch({
    // 委托父级
    receiver: '.js-par',
    // 操作的元素
    operator: '.js-el',
    // 移动范围限制；
    limit:{
        x:0.5,
        y:0.5,
        minScale:0.4,
    },
    touchstart(ev){},
    touchmove(ev){},
    touchend(ev){},
    dragstart(ev){},
    drag(ev) {
        ev.setTransform();

        // transform.x += ev.deltaX;
        // transform.y += ev.deltaY;

        // setTransform('.js-el.active', mtouch.limitOperator(ev.transform));
        // setTransform('.js-el',transform);
    },
    dragend(ev){},
    pinchstart(ev){},
    pinch(ev) {
        ev.setTransform();

        // transform.scale *= ev.scale;

        // setTransform('.js-el', ev.transform);
        // setTransform('.js-el',transform);
    },
    pinchend(ev){},
    rotatestart(ev){},
    rotate(ev) {
        ev.setTransform();

        // transform.rotate += ev.rotate;
        // setTransform('.js-el', ev.transform);
        // setTransform('.js-el',transform);
    },
    rotatend(ev){},
    singlePinchstart(ev){},
    singlePinch(ev) {
        ev.setTransform();

        // transform.scale *= ev.scale;

        // setTransform('.js-el', ev.transform);
        // setTransform('.js-el',transform);
    },
    singlePinchend(ev){},
    singlePinchId: 'js-pinch',
    singleRotatestart(ev){},
    singleRotate(ev) {
        // console.log(ev);
        ev.setTransform();
        // transform.rotate += ev.rotate;
        // setTransform('.js-el', ev.transform);
        // setTransform('.js-el',transform);
    },
    singleRotatend(ev){},
    singleRotateId: 'js-pinch'
})


mtouch.setTransform('.el-1',{
    x:($(par).width()-100)/2,
    y:($(par).height()-110)/2,
    scale:1,
    rotate:0
});

$('.js-el').on('tap',function(){
    $('.js-el').removeClass('active');
    $(this).addClass('active');
    mtouch.switchOperator(this);
})

function setTransform(el,transform) {
    $(el).css('transform',`translate3d(${transform.x}px,${transform.y}px,0px) scale(${transform.scale}) rotate(${transform.rotate}deg)`).data('mtouch-status',JSON.stringify(transform));
}
