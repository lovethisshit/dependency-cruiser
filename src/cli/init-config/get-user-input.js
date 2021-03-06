const inquirer = require("inquirer");
const $defaults = require("../defaults.json");
const {
  fileExists,
  getSourceFolderCandidates,
  getTestFolderCandidates,
  hasTestsWithinSource,
  isLikelyMonoRepo,
  pnpIsEnabled,
  toSourceLocationArray,
  validateLocation,
} = require("./helpers");

const TYPESCRIPT_CONFIG = `./${$defaults.TYPESCRIPT_CONFIG}`;
const WEBPACK_CONFIG = `./${$defaults.WEBPACK_CONFIG}`;

const INQUIRER_QUESTIONS = [
  {
    name: "configType",
    type: "list",
    message: "Do you want to use a preset or a self-contained configuration?",
    choices: ["self-contained", "preset"],
  },
  {
    name: "preset",
    type: "list",
    message: "Pick a preset",
    choices: [
      {
        name: "recommended, warn only (good starter choice)",
        value: "dependency-cruiser/configs/recommended-warn-only",
      },
      {
        name: "recommended, strict",
        value: "dependency-cruiser/configs/recommended-strict",
      },
    ],
    default: "dependency-cruiser/configs/recommended-warn-only",
    when: (pAnswers) => pAnswers.configType === "preset",
  },
  {
    name: "sourceLocation",
    type: "input",
    message: "Where do your source files live?",
    default: getSourceFolderCandidates(),
    validate: (pThisAnswer) => validateLocation(pThisAnswer),
    when: () => !isLikelyMonoRepo(),
  },
  {
    name: "hasTestsOutsideSource",
    type: "confirm",
    message: "Do your test files live in a separate folder?",
    default: (pAnswers) => {
      return !hasTestsWithinSource(
        getTestFolderCandidates(),
        toSourceLocationArray(pAnswers.sourceLocation)
      );
    },
    when: () => !isLikelyMonoRepo(),
  },
  {
    name: "testLocation",
    type: "input",
    message: "Where do your test files live?",
    default: getTestFolderCandidates(),
    validate: (pThisAnswer) => validateLocation(pThisAnswer),
    when: (pAnswers) => pAnswers.hasTestsOutsideSource && !isLikelyMonoRepo(),
  },
  {
    name: "useYarnPnP",
    type: "confirm",
    message: "You seem to be using yarn Plug'n'Play. Take that into account?",
    default: true,
    when: () => pnpIsEnabled(),
  },
  {
    name: "useTsConfig",
    type: "confirm",
    message: "Looks like you're using TypeScript. Use a 'tsconfig.json'?",
    default: true,
    when: () => fileExists(TYPESCRIPT_CONFIG),
  },
  {
    name: "tsConfig",
    type: "input",
    message: "Full path to 'tsconfig.json':",
    default: TYPESCRIPT_CONFIG,
    validate: (pInput) =>
      fileExists(pInput) ||
      `hmm, '${pInput}' doesn't seem to exist - try again?`,
    when: (pAnswers) => pAnswers.useTsConfig,
  },
  {
    name: "tsPreCompilationDeps",
    type: "confirm",
    message:
      "Also regard TypeScript dependencies that exist only before compilation?",
    when: (pAnswers) => fileExists(TYPESCRIPT_CONFIG) && pAnswers.useTsConfig,
  },
  {
    name: "useWebpackConfig",
    type: "confirm",
    message: "Looks like you're using webpack - specify a webpack config?",
    default: true,
    when: () => fileExists(WEBPACK_CONFIG),
  },
  {
    name: "webpackConfig",
    type: "input",
    message: "Full path to webpack config:",
    default: WEBPACK_CONFIG,
    validate: (pInput) =>
      fileExists(pInput) ||
      `hmm, '${pInput}' doesn't seem to exist - try again?`,
    when: (pAnswers) => pAnswers.useWebpackConfig,
  },
];

module.exports = () => inquirer.prompt(INQUIRER_QUESTIONS);
