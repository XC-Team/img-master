const fs = require("fs");
const promisify = require("util").promisify;
const chalk = require("chalk");
const isImage = require("is-image");
const rimraf = require("rimraf");

const readDir = promisify(fs.readdir);
const readStat = promisify(fs.stat);

function help(commander) {
	commander.parse(process.argv);
	if (!commander.args.length) {
		commander.help();
	}
}

async function mapFile({ currPath = process.cwd() + "/src", sucMsg, isFileCb }) {
	const files = await readDir(currPath);
	if (files.constructor !== Array || !files.length) {
		console.log(chalk.white.bgRed("There is no file in the current directory\n"));
		return false;
	}
	for (let file of files) {
		const filePath = currPath + "/" + file;
		const stat = await readStat(filePath);
		if (stat.isFile() && isImage(filePath)) {
			isFileCb && await isFileCb(filePath);
		} else if (stat.isDirectory()) {
			mapFile(filePath);
		}
	}
	console.log(chalk.white.bgGreen("\n" + sucMsg + "\n"));
	return true;
}

async function removeDist() {
	await promisify(rimraf)(process.cwd() + "/dist");
	console.log(chalk.white.bgGreen("\nThe output directory is deleted successfully\n"));
}

module.exports = {
	help,
	mapFile,
	removeDist
};