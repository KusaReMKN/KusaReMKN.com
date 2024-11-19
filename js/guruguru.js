'use strict';

function
guruguru(_)
{
	const now = new Date();
	const sec = now.getSeconds() + now.getMilliseconds()/1000;
	const min = now.getMinutes() + sec/60;
	const hour = now.getHours()%12 + min/60;

	const ths = sec / 30 * Math.PI;
	const thm = min / 30 * Math.PI;
	const thh = hour / 6 * Math.PI;

	const x = Math.cos(ths) + Math.cos(thm) + Math.cos(thh);
	const y = Math.sin(ths) + Math.sin(thm) + Math.sin(thh);
	mikanchan_area.style.transform = `rotate(${Math.atan2(y, x)}rad)`;

	window.requestAnimationFrame(guruguru);
}
window.requestAnimationFrame(guruguru);
