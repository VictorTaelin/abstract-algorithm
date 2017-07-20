const wast2wasm = wast => new Promise((resolve,reject) => {
	const fs = require("fs");
	const exec = require("child_process").exec;
	try {
		fs.writeFileSync("__tmp.wast", wast);
		exec("wast2wasm __tmp.wast -o __tmp.wasm", (err, res) => {
			if (err) {
				reject(err);
			} else {
				const wasm = fs.readFileSync("__tmp.wasm");
				fs.unlinkSync("__tmp.wast");
				fs.unlinkSync("__tmp.wasm");
				resolve(wasm);
			};
		});
	} catch (e) {
		reject(e);
	};
});

const buildInstance = (wast, imports) =>
	wast2wasm(wast)
		.then(wasm => WebAssembly.instantiate(wasm, imports));

const build = (wast, imports) =>
	buildInstance(wast, imports)
		.then(instance => instance.instance.exports);

module.exports = {
	wast2wasm,
	buildInstance,
	build
};
