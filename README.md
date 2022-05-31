# ui.frontend with esbuild for Adobe Experience Manager development

## Experimental

This has not been developed or tested using an instance of Adobe Experience Manager and extensive testing would be an expected implementation detail before using this in a production website.

## Features

-   Incredibly fast build times (**less than 1 second** per clientlib)
-   Support for multiple clientlibs
-   Watch features to support quicker development
-   TypeScript and JavaScript linting
-   Full Sass/SCSS support
-   Globbing

## Does not include

-   IE Support: was not considered in the development of this module
-   The Static Server: currently dropped in favor of `aemsync` (directly syncing to AEM)

## Installation

Currently must be done manually by doing the following:

-   add esbuilder.mjs and globSass.mjs
-   updating package.json to match this repo's
-   restructuring folders under src
-   removing unused files (webpack)
-   I updated my node version and switched to using pnpm in my pom.xml (more at bottom)

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

### My root pom frontend-maven-plugin config

```xml
<plugin>
    <groupId>com.github.eirslett</groupId>
    <artifactId>frontend-maven-plugin</artifactId>
    <version>${frontend-maven-plugin.version}</version>
    <configuration>
        <nodeVersion>v16.15.0</nodeVersion>
        <npmVersion>8.5.5</npmVersion>
        <pnpmVersion>7.1.1</pnpmVersion>
    </configuration>
    <executions>
        <execution>
            <id>install node and npm and pnpm</id>
            <goals>
                <goal>install-node-and-npm</goal>
                <goal>install-node-and-pnpm</goal>
            </goals>
        </execution>
        <execution>
            <id>pnpm install</id>
            <goals>
                <goal>pnpm</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```
