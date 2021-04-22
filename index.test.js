jest.mock("fs", () => require("memfs"));
jest.mock("mrm-core/src/util/log", () => ({
  added: jest.fn()
}));
const mockInstall = jest.fn();
jest.mock("mrm-core/src/npm", () => ({
  install: mockInstall
}));

const vol = require("memfs").vol;
const task = require("./index");

const stringify = (o) => JSON.stringify(o, null, "  ");

const cwd = `${process.cwd()}/`;
const removeWorkingDir = (obj) =>
  Object.keys(obj).reduce((acc, key) => {
    acc[key.replace(cwd, "")] = obj[key];
    return acc;
  }, {});

afterEach(() => vol.reset());

const scaffold = ({ caseName, fsStatus = {}, eslintConfig }) => {
  describe(`for a ${caseName}`, () => {
    beforeAll(() => {
      vol.fromJSON(fsStatus);

      task({ eslintConfig });
    });

    it(`should add TypeScript ESLint to ${caseName}`, () => {
      expect(removeWorkingDir(vol.toJSON())).toMatchSnapshot();
    });

    it("should install TypeScript ESLint plugins", () => {
      expect(mockInstall).toHaveBeenCalledWith([
        "@typescript-eslint/eslint-plugin",
        "@typescript-eslint/parser"
      ]);
    });
  });
};

[
  {
    caseName: "empty .eslintrc.yaml"
  },
  {
    caseName: "preexisting .eslintrc.yaml",
    fsStatus: {
      "./.eslintrc.yaml": stringify("")
    },
    eslintConfig: "./.eslintrc.yaml"
  },
  {
    caseName: "preexisting .eslintrc.json",
    fsStatus: {
      "./.eslintrc.json": stringify("")
    },
    eslintConfig: "./.eslintrc.json"
  },
  {
    caseName: "preexisting .eslintrc",
    fsStatus: { "./eslintrc": stringify({}) },
    eslintConfig: "./.eslintrc"
  },
  {
    caseName: "preexisting .eslintrc 2",
    fsStatus: {
      "./.eslintrc": stringify({
        extends: ["airbnb", "prettier"],
        parser: "babel-eslint",
        plugins: ["react", "prettier"],
        parserOptions: {
          ecmaFeatures: {
            experimentalObjectRestSpread: 1
          },
          sourceType: "script"
        }
      })
    },
    eslintConfig: "./.eslintrc"
  }
].forEach(scaffold);
