import { SSM, SharedIniFileCredentials, config } from 'aws-sdk';
import { PutParameterRequest, GetParameterRequest } from 'aws-sdk/clients/ssm';
import { parse } from 'ini';
import { resolve } from 'path';
import { homedir } from 'os';
import { readFileSync } from 'fs';

function readAWSRegionFromConfig(profile) {
  const iniFile = parse(readFileSync(resolve(homedir(), '.aws/credentials'), 'utf-8'))
  return iniFile[profile].region;
}

export function getParameter(profile: string, params: GetParameterRequest) {
  setProfile(profile);
  return new SSM().getParameter(params).promise();
}

export function putParameter(profile: string, params: PutParameterRequest) {
  setProfile(profile);
  return new SSM().putParameter(params).promise();
}

function setProfile(profile) {
  const credentials = new SharedIniFileCredentials({ profile });
  //note(itay): node aws-sdk doesn't load the region
  //from the ini profile, so we have to update it manually.
  const region = readAWSRegionFromConfig(profile);
  config.update({ credentials, region });
}
