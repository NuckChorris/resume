(function () {
	'use strict';
	let hash = location.hash.slice(1);
	let path = `openings/${hash}.json`;
	// TODO: switch to async
	let xhr = new XMLHttpRequest();
	xhr.open('GET', path, false);
	xhr.send();
	let opening = JSON.parse(xhr.responseText);
	console.log(opening);

	let varNodes = document.querySelectorAll('[data-var]');
	for (let node of varNodes) {
		(new Template(node)).execute(opening);
	}
})();
