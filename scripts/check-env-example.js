#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const ENV_REFERENCE = /process\.env\.([A-Z][A-Z0-9_]*)/g;

/**
 * Every workspace whose source reads environment variables, the directories to
 * scan and the example file that is supposed to document them.
 */
const WORKSPACES = [
  {
    name: 'server',
    directories: ['server/src', 'server/prisma'],
    extensions: ['.js'],
    example: 'server/.env.example',
  },
  {
    name: 'client',
    directories: ['client/app', 'client/components', 'client/lib', 'client/store'],
    extensions: ['.ts', '.tsx'],
    example: 'client/.env.example',
  },
];

/** Collects and de-duplicates every environment reference below a directory. */
const collectReferencedEnv = (directories, extensions) => {
  const names = new Set();

  const walk = (directory) => {
    if (!fs.existsSync(directory)) return;

    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const current = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        walk(current);
      } else if (extensions.includes(path.extname(entry.name))) {
        const contents = fs.readFileSync(current, 'utf8');
        for (const match of contents.matchAll(ENV_REFERENCE)) {
          names.add(match[1]);
        }
      }
    }
  };

  for (const directory of directories) walk(directory);

  return [...names].sort();
};

/** Reads the keys declared in an example file, ignoring comments and blanks. */
const parseExampleKeys = (contents) => {
  const keys = new Set();

  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=/);
    if (match) keys.add(match[1]);
  }

  return [...keys].sort();
};

/** Returns the referenced variables the example file does not document. */
const missingEnvKeys = ({ referenced, documented }) => {
  const known = new Set(documented);
  return referenced.filter((key) => !known.has(key));
};

const checkEnvExamples = ({ root = ROOT } = {}) =>
  WORKSPACES.map((workspace) => {
    const referenced = collectReferencedEnv(
      workspace.directories.map((directory) => path.join(root, directory)),
      workspace.extensions,
    );
    const examplePath = path.join(root, workspace.example);
    const documented = fs.existsSync(examplePath)
      ? parseExampleKeys(fs.readFileSync(examplePath, 'utf8'))
      : [];

    return {
      name: workspace.name,
      example: workspace.example,
      referenced,
      missing: missingEnvKeys({ referenced, documented }),
      exampleExists: fs.existsSync(examplePath),
    };
  });

const main = () => {
  const results = checkEnvExamples();
  let failed = false;

  for (const result of results) {
    if (!result.exampleExists) {
      console.error(`[${result.name}] missing example file: ${result.example}`);
      failed = true;
      continue;
    }

    if (result.missing.length > 0) {
      console.error(
        `[${result.name}] ${result.missing.length} variable(s) referenced in source but missing from ${result.example}:`,
      );
      for (const key of result.missing) console.error(`  - ${key}`);
      failed = true;
      continue;
    }

    console.log(
      `[${result.name}] ${result.referenced.length} referenced variable(s) documented in ${result.example}`,
    );
  }

  process.exitCode = failed ? 1 : 0;
};

if (require.main === module) main();

module.exports = {
  WORKSPACES,
  collectReferencedEnv,
  parseExampleKeys,
  missingEnvKeys,
  checkEnvExamples,
};
