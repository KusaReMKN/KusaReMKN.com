'use strict';

/*
 * なでなでみかんちゃん
 * iPhone などでは touchstart のイベントハンドラを設定するだけで
 * CSS の :hover とか :active とかが仕事をしてくれるが、
 * Android ではそうもいかないようなので強行手段を取る。
 * touchend と touchcancel の際にタッチ時のゴミを取り去る。
 */

const mikanTab = {
	'touchstart': '0',
	'touchmove': '0',
	'touchend': '1',
	'touchcancel': '1',
};

function
touchHandler(e)
{
	e.preventDefault();
	mikanchan.style.opacity = mikanTab[e.type] || '1';
}

mikanchan.addEventListener('touchstart', touchHandler);
mikanchan.addEventListener('touchmove', touchHandler);
mikanchan.addEventListener('touchend', touchHandler);
mikanchan.addEventListener('touchcancel', touchHandler);
