'use strict';

class Template {
	constructor (node) {
		this._node = node;
		let vars = Template._splitVars(node.getAttribute('data-var'));
		for (let key in vars) {
			if (vars.hasOwnProperty(key)) {
				if (vars[key] === '$') {
					vars[key] = node.getAttribute(`data-${key}`);
				} else {
					vars[key] = '${' + vars[key] + '}';
				}
			}
		}
		this._vars = vars;
	}
	execute (env) {
		for(let key in this._vars) {
			if (this._vars.hasOwnProperty(key)) {
				let result = this._vars[key].replace(Template.REGEX, (trash, str) => {
					return Template._resolveDots(str, env);
				});
				
				if (key === 'content') {
					this._node.textContent = result;
				} else {
					this._node.setAttribute(key, result);
				}
			}
		}
	}
}
Template.REGEX = /\${(\S+)}/g;
Template._splitVars = function parseVars (vars) {
	vars = vars.split(/,/);
	let out = {};
	for (let v of vars) {
		let [key, ...value] = v.split('=');
		value = value.join('=');
		out[key] = value;
	}
	return out;
};
Template._resolveDots = function resolveDots (str, obj) {
	if (obj === undefined || obj === null) {
		return obj;
	}
	if (str.indexOf('.') !== -1) {
		let [ours, ...theirs] = str.split('.');
		return Template._resolveDots(theirs.join('.'), obj[ours]);
	} else {
		return obj[str];
	}
};
