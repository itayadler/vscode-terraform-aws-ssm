import { SSM, SharedIniFileCredentials, config } from 'aws-sdk';
import { PutParameterRequest, GetParameterRequest } from 'aws-sdk/clients/ssm';
import { parse } from 'ini';
import { resolve } from 'path';
import { homedir } from 'os';
import { readFileSync } from 'fs';

function getAWSCredentialsAsObject() {
  return parse(readFileSync(resolve(homedir(), '.aws/credentials'), 'utf-8'));
}

function readAWSRegionFromConfig(profile) {
  const iniFile = getAWSCredentialsAsObject();
  return iniFile[profile].region;
}

export function getAWSProfiles() {
  const iniFile = getAWSCredentialsAsObject();
  return Object.keys(iniFile);
}

export function getSSMParameter(profile: string, params: GetParameterRequest) {
  setProfile(profile);
  return new SSM().getParameter(params).promise();
}

export function putSSMParameter(profile: string, params: PutParameterRequest) {
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
