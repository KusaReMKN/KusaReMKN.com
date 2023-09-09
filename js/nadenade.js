'use strict';

/*
 * なでなでみかんちゃん
 * iPhone などでは touchstart のイベントハンドラを設定するだけで
 * CSS の :hover とか :active とかが仕事をしてくれるが、
 * Android ではそうもいかないようなので強行手段を取る。
 * touchend と touchcancel の際にタッチ時のゴミを取り去る。
 */

const mikanTab = {
	'touchstart': 'url("/img/mikanchan2.webp")',
	'touchmove': 'url("/img/mikanchan3.webp")',
	'touchend': null,
	'touchcancel': null,
};

function
touchHandler(e)
{
	e.preventDefault();
	mikanchan.style.backgroundImage = mikanTab[e.type] || null;
}

mikanchan.addEventListener('touchstart', touchHandler);
mikanchan.addEventListener('touchmove', touchHandler);
mikanchan.addEventListener('touchend', touchHandler);
mikanchan.addEventListener('touchcancel', touchHandler);
