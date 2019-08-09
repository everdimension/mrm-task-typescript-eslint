const { yaml, json, install } = require("mrm-core");

const packages = [
  "@typescript-eslint/eslint-plugin",
  "@typescript-eslint/parser"
];

function task(config) {
  const { eslintConfig: eslintConfigFileName } = config.values();

  const eslintConfig = findESLintConfig(eslintConfigFileName);

  const toBeMerged = {
    parser: "@typescript-eslint/parser",
    settings: {
      "import/parsers": {
        "@typescript-eslint/parser": [".js", ".jsx", ".ts", ".tsx"]
      }
    }
  };

  toBeMerged["plugins"] = eslintConfig.get("plugins", []);
  toBeMerged["plugins"].push("@typescript-eslint");

  toBeMerged["extends"] = eslintConfig.get("extends", []);
  toBeMerged["extends"].unshift(
    "plugin:@typescript-eslint/recommended",
    "plugin:import/typescript"
  );

  eslintConfig.merge(toBeMerged).save();

  // Dependencies
  install(packages);
}
task.description = "Adds TypeScript ESLint";

function findESLintConfig(eslintConfigFileName) {
  if (eslintConfigFileName) {
    return eslintConfigFileName.endsWith(".yaml") ||
      eslintConfigFileName.endsWith(".yml")
      ? yaml(eslintConfigFileName)
      : json(eslintConfigFileName);
  }

  if (yaml(".eslintrc.yaml")) return yaml(".eslintrc.yaml");
  if (yaml(".eslintrc.yml")) return yaml(".eslintrc.yml");
  if (json(".eslintrc.json")) return json(".eslintrc.json");
  if (json(".eslintrc")) return json(".eslintrc");
  return yaml(".eslintrc.yaml");
}

module.exports = task;
