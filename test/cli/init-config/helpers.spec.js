const expect = require("chai").expect;
const {
  getFolderCandidates,
  folderNameArrayToRE,
  pnpIsEnabled,
  isLikelyMonoRepo,
  hasTestsWithinSource,
  validateLocation,
} = require("../../../src/cli/init-config/helpers");

describe("cli/init-config/helpers - pnpIsEnabled", () => {
  const WORKINGDIR = process.cwd();

  afterEach("tear down", () => {
    process.chdir(WORKINGDIR);
  });

  it("returns false when there is no package.json", () => {
    process.chdir(
      "test/cli/fixtures/init-config/pnpIsEnabled/no-package-json-here"
    );
    expect(pnpIsEnabled()).to.equal(false);
  });

  it("returns false when the package.json is invalid json", () => {
    process.chdir(
      "test/cli/fixtures/init-config/pnpIsEnabled/package-json-invalid"
    );
    expect(pnpIsEnabled()).to.equal(false);
  });

  it("returns false when the package.json does not contain the installConfig key", () => {
    process.chdir(
      "test/cli/fixtures/init-config/pnpIsEnabled/no-installConfig-key"
    );
    expect(pnpIsEnabled()).to.equal(false);
  });

  it("returns false when the package.json contains the installConfig key, but not the pnp subkey", () => {
    process.chdir(
      "test/cli/fixtures/init-config/pnpIsEnabled/pnp-attribute-missing"
    );
    expect(pnpIsEnabled()).to.equal(false);
  });

  it("returns false when the package.json contains the installConfig key, but the pnp subkey === false", () => {
    process.chdir(
      "test/cli/fixtures/init-config/pnpIsEnabled/pnp-attribute-false"
    );
    expect(pnpIsEnabled()).to.equal(false);
  });

  it("returns true when the package.json contains the installConfig.pnp key, with value true", () => {
    process.chdir(
      "test/cli/fixtures/init-config/pnpIsEnabled/pnp-attribute-true"
    );
    expect(pnpIsEnabled()).to.equal(true);
  });
});

describe("cli/init-config/helpers - isLikelyMonoRepo", () => {
  it("declares the current folder to be not a mono repo", () => {
    expect(isLikelyMonoRepo()).to.equal(false);
  });
  it("no folders => no mono repo", () => {
    expect(isLikelyMonoRepo([])).to.equal(false);
  });
  it("no packages in the array of folders => no mono repo", () => {
    expect(isLikelyMonoRepo(["bin", "src", "node_modules", "test"])).to.equal(
      false
    );
  });
  it("packages in the array of folders => mono repo", () => {
    expect(isLikelyMonoRepo(["packages"])).to.equal(true);
  });
});

describe("cli/init-config/helpers - hasTestsWithinSource", () => {
  it("When there's no sign of a separate test directory - tests are in the source", () => {
    expect(hasTestsWithinSource([])).to.equal(true);
  });

  it("When there's a separate test directory - tests are separate", () => {
    expect(hasTestsWithinSource(["spec"], ["src"])).to.equal(false);
  });

  it("When one test directory is also a source directy - tests are in the source", () => {
    expect(hasTestsWithinSource(["src"], ["bin", "src", "types"])).to.equal(
      true
    );
  });

  it("When all test directories are also in the source directory array - tests are in the source", () => {
    expect(
      hasTestsWithinSource(["src", "lib"], ["bin", "src", "types", "lib"])
    ).to.equal(true);
  });

  it("When only a part of  test directories are also in the source directory array - tests not in the source (for now)", () => {
    expect(
      hasTestsWithinSource(
        ["src", "lib", "spec"],
        ["bin", "src", "types", "lib"]
      )
    ).to.equal(false);
  });
});

describe("cli/init-config/helpers - getFolderCandidates", () => {
  it("returns candidates verbatim when it's likely a mono repo", () => {
    const lCandidates = ["src", "bin"];
    const lRealFolders = ["packages", "src", "lib", "node_modules"];

    expect(getFolderCandidates(lCandidates)(lRealFolders)).to.deep.equal(
      lCandidates
    );
  });

  it("returns only existing folders when it's not a monorepo", () => {
    const lCandidates = ["src", "bin"];
    const lRealFolders = ["src", "lib", "node_modules"];

    expect(getFolderCandidates(lCandidates)(lRealFolders)).to.deep.equal([
      "src",
    ]);
  });
});
describe("cli/init-config/helpers - folderNameArrayToRE", () => {
  it("transforms an array of folder names into a regex string - empty", () => {
    expect(folderNameArrayToRE([])).to.equal("^()");
  });
  it("transforms an array of folder names into a regex string - one entry", () => {
    expect(folderNameArrayToRE(["src"])).to.equal("^(src)");
  });
  it("transforms an array of folder names into a regex string - more than one entry", () => {
    expect(folderNameArrayToRE(["bin", "src", "lib"])).to.equal(
      "^(bin|src|lib)"
    );
  });
});

describe("cli/init-config/helpers - validateLocation", () => {
  const WORKING_DIR = process.cwd();
  const FIXTURES_DIR = "test/cli/fixtures/init-config/validate-location";

  afterEach("tear down", () => {
    process.chdir(WORKING_DIR);
  });

  it("returns an error message when provided with an empty string", () => {
    expect(validateLocation("")).to.equal(
      "'' doesn't seem to exist - please try again"
    );
  });

  it("returns an error message when provided with a non-existing folder name", () => {
    process.chdir(FIXTURES_DIR);
    expect(validateLocation("non-existing-folder")).to.equal(
      "'non-existing-folder' doesn't seem to exist - please try again"
    );
  });

  it("returns an error message when provided with a name of a file that is not a folder", () => {
    process.chdir(FIXTURES_DIR);
    expect(validateLocation("existing-file")).to.equal(
      "'existing-file' doesn't seem to be a folder - please try again"
    );
  });

  it("returns true when provided with an existing folder", () => {
    process.chdir(FIXTURES_DIR);
    expect(validateLocation("existing-folder")).to.equal(true);
  });

  it("returns true when provided with a c.s.l. of existing folders", () => {
    process.chdir(FIXTURES_DIR);
    expect(
      validateLocation("existing-folder, another-existing-folder")
    ).to.equal(true);
  });

  it("returns an error message when provided with a c.s.l. of existing + non-existing folders", () => {
    process.chdir(FIXTURES_DIR);
    expect(
      validateLocation(
        "existing-folder, non-existing-folder, another-existing-folder"
      )
    ).to.equal(
      "'non-existing-folder' doesn't seem to exist - please try again"
    );
  });

  it("returns true when provided with an array of existing folders", () => {
    process.chdir(FIXTURES_DIR);
    expect(
      validateLocation(["existing-folder", "another-existing-folder"])
    ).to.equal(true);
  });
});
