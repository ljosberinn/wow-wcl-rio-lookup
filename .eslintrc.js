const { createConfig } = require("eslint-config-galex/dist/createConfig");
const { getDependencies } = require("eslint-config-galex/dist/getDependencies");
const {
  createJestOverride,
} = require("eslint-config-galex/dist/overrides/jest");

const customNextJsOverride = {
  rules: {
    "import/no-default-export": "off",
  },
  files: ["src/pages/**/*.?(t|j)s?(x)", "pages/**/*.?(t|j)s?(x)"],
};

/**
 * read more on how to customize this config:
 *
 * @see https://github.com/ljosberinn/eslint-config-galex#i-went-through-30-eslint-plugins-so-you-dont-have-to
 */
module.exports = createConfig({
  overrides: [customNextJsOverride],
});
