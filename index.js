const { yaml, json, install } = require("mrm-core");

const packages = [
  "@typescript-eslint/eslint-plugin",
  "@typescript-eslint/parser"
];

function task(config) {
  const { eslintConfig: eslintConfigFileName } = config;

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

function findESLintConfig(eslintConfigFileName) {
  if (eslintConfigFileName) {
    return eslintConfigFileName.endsWith(".yaml") ||
      eslintConfigFileName.endsWith(".yml")
      ? yaml(eslintConfigFileName)
      : json(eslintConfigFileName);
  }

  if (yaml(".eslintrc.yaml").exists()) return yaml(".eslintrc.yaml");
  if (yaml(".eslintrc.yml").exists()) return yaml(".eslintrc.yml");
  if (json(".eslintrc.json").exists()) return json(".eslintrc.json");
  if (json(".eslintrc").exists()) return json(".eslintrc");
  return yaml(".eslintrc.yaml");
}

module.exports = task;

module.exports.description = "Adds TypeScript ESLint";
module.exports.parameters = {
  eslintConfig: {
    type: "input",
    message: "Enter filename for the eslint configuration file",
    default: ".eslintrc.yaml"
  }
};
