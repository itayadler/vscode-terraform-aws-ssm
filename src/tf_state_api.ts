import { parse } from 'ini';
import * as shell from 'shelljs';

export enum TerraformError {
  None,
  NoTerraformInstalled,
  NotAuthorized,
  FailedToLoadBackend,
  EmptyResponse
}

export interface ShowResourceResult {
  Properties: Map<string, string>;
  Error?: TerraformError;
}

export function executeTerraformInit(workingDirectory, awsProfile = "default") {
  if (!shell.which('terraform')) {
    return TerraformError.NoTerraformInstalled;
  }
  shell.cd(workingDirectory);
  shell.env["AWS_PROFILE"] = awsProfile;
  return new Promise((resolve, reject)=> {
    shell.exec(`terraform init`, (code, stdout, stderr)=> {
      if (code !== 0) {
        resolve(TerraformError.NotAuthorized);
      } else {
        resolve(null);
      }
    });
  });
}

export function showResource(resourceName, workingDirectory, awsProfile = "default") {
  const resourceProperties = new Map<string, string>();
  if (!shell.which('terraform')) {
    return { Properties: resourceProperties, Error: TerraformError.NoTerraformInstalled };
  }
  shell.cd(workingDirectory);
  // shell.env["TF_LOG"] = "TRACE";
  shell.env["AWS_PROFILE"] = awsProfile;
  return new Promise((resolve, reject)=> {
    shell.exec(`terraform state show ${resourceName}`, (code, stdout, stderr)=> {
      if (code === 0) {
        if (!stdout) {
          resolve({ Properties: resourceProperties, Error: TerraformError.EmptyResponse });
        }
        const iniProperties = parse(stdout);
        Object.keys(iniProperties)
          .forEach(key => resourceProperties.set(key, iniProperties[key]));
        resolve({ Properties: resourceProperties });
      } else {
        if (stderr.toString().indexOf("Failed to load backend") > -1) {
          resolve({ Properties: resourceProperties, Error: TerraformError.FailedToLoadBackend });
        } else if (stderr.toString().indexOf("Failed to load state: AccessDenied") > -1) {
          resolve({ Properties: resourceProperties, Error: TerraformError.NotAuthorized });
        }
      }
    });
  });
}