require('ts-node').register();
const assert = require('assert');
const { readFileSync } = require('fs');
const { resolve } = require('path');
const { extractSSMKeysFromFile } = require('../tf_ssm_file_parser');

describe("tf_ssm_file_parser", function () {

  before(function () {
    this.exampleFile = readFileSync(resolve(__dirname, './test_data/ssm_env_variables_example.tf')).toString();
  })

  it("should parse ssm keys", function () {
    const result = extractSSMKeysFromFile(this.exampleFile);
    assert.equal(result.length, 2);
    assert.equal(result[0].Path, '"/${data.terraform_remote_state.vpc.env}/${data.terraform_remote_state.vpc.region}/some-service/key_one"');
    assert.equal(result[0].Line, 2);
    assert.equal(result[0].Column, 10);
    assert.equal(result[0].Offset, 46);
    assert.equal(result[1].Path, '"/${data.terraform_remote_state.vpc.env}/${data.terraform_remote_state.vpc.region}/some-service/key_two"');
    assert.equal(result[1].Line, 6);
    assert.equal(result[1].Column, 10);
    assert.equal(result[1].Offset, 200);
  });
});