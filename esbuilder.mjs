import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import globSass from 'esbuild-sass-glob';
import clientlibConfig from './clientlib.config.js';
import { execSync } from 'child_process';

// plugins
import postcss from 'postcss';
import postcssPresetEnv from 'postcss-preset-env';
import autoprefixer from 'autoprefixer';
import eslint from 'esbuild-plugin-eslint';
import { sassPlugin } from 'esbuild-sass-plugin';
import cleanPlugin from 'esbuild-plugin-clean';
import EsbuildPluginImportGlob from 'esbuild-plugin-import-glob';

const copy = ({ from, to }) => {
	return {
		name: 'copy',
		setup(build) {
			const { outdir } = build.initialOptions;

			build.onEnd(() =>
				fs.cpSync(
					path.resolve(process.cwd(), from),
					path.resolve(
						process.cwd(),
						path.join(path.dirname(outdir), to)
					),
					{
						recursive: true,
						force: true,
						dereference: true,
					}
				)
			);
		},
	};
};

const outputDirName = 'dist';
const isProd = process.argv.includes('--prod');
const isWatch = process.argv.includes('--watch');

const build = async (clientlib) => {
	const timerStart = Date.now();

	if (!fs.existsSync(`./src/main/${clientlib}`)) {
		console.log(
			`〰 skipping clientlib-${clientlib}: ui.frontend/src/main/${clientlib} does not exist.`
		);
		return;
	}

	try {
		await esbuild.build({
			entryPoints: [`./src/main/${clientlib}/site.ts`],
			bundle: true,
			outdir: `${outputDirName}/clientlib-${clientlib}`,
			minify: isProd,
			metafile: true,
			plugins: [
				EsbuildPluginImportGlob.default(),
				cleanPlugin.default({
					verbose: false,
					patterns: [`./${outputDirName}/clientlib-${clientlib}`],
				}),
				sassPlugin({
					precompile: (source, pathname) => {
						return globSass(source, pathname);
					},
					async transform(source) {
						const { css } = await postcss([
							autoprefixer,
							postcssPresetEnv({ stage: 0 }),
						]).process(source, { from: undefined });
						return css;
					},
				}),
				// eslint({ fix: !isWatch }),
				copy({
					from: './src/main/resources',
					to: `./clientlib-${clientlib}`,
				}),
			],
			sourcemap: !isProd,
			external: [],
		});
	} catch (error) {
		console.log(error);
		process.exit(1);
	}

	const timerEnd = Date.now();
	console.log(
		`✔ dist/clientlib-${clientlib} generated from /${clientlib} in ${
			timerEnd - timerStart
		}ms.`
	);
};

const splitFirstHyphen = (str) => {
	let a = str.split('-');
	let front = a[0];
	let back = a.slice(1).join('');

	return [front, back];
};

const generateClientlibs = () => {
	const { stdout, stderr } = execSync('clientlib --verbose');
	if (process.argv.includes('--verbose')) {
		console.log(stdout, stderr);
	} else {
		console.log('\n✔ clientlib generation finished.');
	}
};

const syncToAem = () => {
	const result = execSync(
		'aemsync -d -p ../ui.apps/src/main/content'
	).toString();
	console.log('\nsyncing with aem ...');
	console.log(result);
};

const buildAll = async () => {
	console.log('🔨 Building frontend...\n');
	const timerStart = Date.now();

	for (const clientlib of clientlibConfig.libs) {
		const [_, folder] = splitFirstHyphen(clientlib.name);

		await build(folder);
	}

	generateClientlibs();
	syncToAem();

	const timerEnd = Date.now();
	console.log(`✔ Built in ${timerEnd - timerStart}ms.`);
};

if (isWatch) {
	// first build
	await buildAll();

	const watcher = chokidar.watch(
		'./src/**/*.scss',
		'./src/**/*.ts',
		'./src/**/*.js'
	);
	console.log('\nWatching /src files for changes...');

	watcher.on('change', async () => {
		console.log();
		await buildAll();
	});
} else {
	await buildAll();
}
