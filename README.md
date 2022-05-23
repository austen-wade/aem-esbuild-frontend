# ui.frontend with esbuild for Adobe Experience Manager development

## Experimental

This has not been developed or tested using an instance of Adobe Experience Manager and extensive testing would be an expected implementation detail before using this in a production website.

## Features

-   Incredibly fast build times (**~300ms** per clientlib)
-   Support for multiple clientlibs
-   Watch features to support quicker development
-   TypeScript and JavaScript linting (using a TSLint ruleset – driven by ESLint - rules can be adjusted to suit your team's needs).
-   Full Sass/Scss support (Sass is compiled to CSS via Webpack).
-   Globbing

## Does not include

-   IE Support: was not considered in the development of this module
-   The Static Server: currently dropped in favor of `aemsync` (directly syncing to AEM)

## Installation

Must be done manually by doing the following, though would love to add to the archetype as a separate module:

-   add esbuilder.mjs
-   swapping package.json
-   restructuring folders under src
-   removing unused files (webpack)

## Usage

The following npm scripts drive the frontend workflow:

-   `npm run dev` - Full build of client libraries with source maps.
-   `npm run prod` - Full build of client libraries build with select optimizations and source maps disabled.
-   `npm run start` - Watches for file changes below ui.frontend/src and will rebuild/sync clientlibs.
-   `npm run sync` - Syncs AEM content below ../ui.apps/src/main/content

## Multiple Clientlib Generation

Out of the box the build will create multiple /clientlib-\* folders based on your clientlib.config.js.

### Example:

in clientlib.config.js:

`name: 'clientlib-website',`

will use a folder named ui.frontend/src/main/**website** to create ui.frontend/dist/clientlib-**website** (and because it uses the same clientlib.config.js as `aem-clientlib-generator`, this will also be created in your ui.apps clientlibs).
