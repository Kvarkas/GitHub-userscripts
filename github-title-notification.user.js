// ==UserScript==
// @name          GitHub Title Notification
// @version       1.0.2
// @description   A userscript that changes the document title if there are unread messages
// @license       https://creativecommons.org/licenses/by-sa/4.0/
// @namespace     https://github.com/Mottie
// @include       https://github.com/*
// @run-at        document-idle
// @grant         GM_registerMenuCommand
// @grant         GM_getValue
// @grant         GM_setValue
// @author        Rob Garrison
// @updateURL     https://raw.githubusercontent.com/Mottie/Github-userscripts/master/github-title-notification.user.js
// @downloadURL   https://raw.githubusercontent.com/Mottie/Github-userscripts/master/github-title-notification.user.js
// ==/UserScript==
(() => {
	"use strict";

	let timer,
		// indicator added to document title (it will be wrapped in parentheses)
		indicator = GM_getValue("indicator", "♥"),
		// check every 30 seconds
		interval = GM_getValue("interval", 30);

	function check() {
		let title = document.title,
			mail = document.querySelector(".mail-status"),
			hasUnread = mail ? mail.classList.contains("unread") : false;
		//
		if (!/^\(\d+\)/.test(title)) {
			title = title.replace(/^(\([^)]+\)\s)*/g, "");
		}
		document.title = hasUnread ? "(" + indicator + ") " + title : title;
	}

	function setTimer() {
		clearInterval(timer);
		if (document.querySelector(".mail-status")) {
			timer = setInterval(() => {
				check();
			}, interval * 1000);
			check();
		}
	}

	// Add GM options
	GM_registerMenuCommand("Set GitHub Title Notification Indicator", () => {
		indicator = prompt("Indicator Value (it will be wrapped in parentheses)?", indicator);
		GM_setValue("indicator", indicator);
		check();
	});
	GM_registerMenuCommand("Set GitHub Title Notification Interval", () => {
		interval = prompt("Interval Value (in seconds)?", interval);
		GM_setValue("interval", interval);
		setTimer();
	});

	setTimer();

})();
