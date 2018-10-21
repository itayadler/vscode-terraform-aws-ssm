require('ts-node').register();
// const assert = require('assert');
const { readFileSync } = require('fs');
const { resolve } = require('path');
const { Ast, ParseError } = require('../ast');
const { parseHcl } = require('../hcl-hil/hcl-hil-wrapper');

describe("tf_ssm_file_parser", function () {

  before(function () {
    this.exampleFile = readFileSync(resolve(__dirname, './test_data/ssm_env_variables_example.tf')).toString();
  })

  it("should parse ssm keys", function () {
    const [ast, error] = parseHcl(this.exampleFile);
    console.log(ast.Node.Items[0].Keys);
  });
});