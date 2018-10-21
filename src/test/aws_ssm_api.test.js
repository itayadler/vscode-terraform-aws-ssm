require('ts-node').register();
const assert = require('assert');
const { getParameter, putParameter } = require('../aws_ssm_api');

describe("aws_ssm_api", function () {

  it("should getParameter successfully", async function () {
    // const result = await getParameter("default", { Name: "/some/path", WithDecryption: true })
    // console.log(result);
  });
});