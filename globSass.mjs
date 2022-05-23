import fg from 'fast-glob';

const regex = /@?import + ?((\w+) +from )?([\'\"])(.*?);?\3/gm;
const importSass = /@import +([\'\"])(.*?)\1/gm;

const replacer = (match, fromStatement, obj, quote, filename, pathname) => {
	if (!filename.match(/\*/)) {
		return match;
	}

	var globRelativePath = filename.match(/!?([^!]*)$/)[1];
	var prefix = filename.replace(globRelativePath, '');
	var cwdPath = pathname.substring(0, pathname.lastIndexOf('/'));

	var result = fg
		.sync(globRelativePath, { cwd: cwdPath })
		.map((file) => {
			var fileName = quote + prefix + file + quote;

			if (match.match(importSass)) {
				return '@import ' + fileName;
			} else {
				console.error('Unknown import: "' + match + '"');
				process.exit(1);
			}
		})
		.join('; ');

	if (!result) {
		console.error('Empty results for "' + match + '"');
	}

	return result;
};

export default (content, pathname) => {
	return content.replace(
		regex,
		(match, fromStatement, obj, quote, filename) =>
			replacer(match, fromStatement, obj, quote, filename, pathname)
	);
};
