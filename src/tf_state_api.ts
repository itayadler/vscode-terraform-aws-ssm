import { parse } from 'ini';
import * as shell from 'shelljs';

export enum ShowResourceError {
  NoTerraformInstalled,
  NotAuthorized,
  FailedToLoadBackend
}

export interface ShowResourceResult {
  Properties: Map<string, string>;
  Error?: ShowResourceError;
}

export async function showResource(resourceName, workingDirectory, awsProfile = "default"): Promise<ShowResourceResult> {
  const resourceProperties = new Map<string, string>();
  if (!shell.which('terraform')) {
    return { Properties: resourceProperties, Error: ShowResourceError.NoTerraformInstalled };
  }
  shell.cd(workingDirectory);
  shell.env["TF_LOG"] = "TRACE";
  shell.env["AWS_PROFILE"] = awsProfile;
  const { code, stdout, stderr } = shell.exec(`terraform state show ${resourceName}`);
  if (code === 0) {
    const iniProperties = parse(stdout);
    Object.keys(iniProperties)
      .forEach(key => resourceProperties.set(key, iniProperties[key]));
    return { Properties: resourceProperties };
  } else {
    if (stderr.toString().indexOf("Failed to load backend") > -1) {
      return { Properties: resourceProperties, Error: ShowResourceError.FailedToLoadBackend };
    } else if (stderr.toString().indexOf("Failed to load state: AccessDenied") > -1) {
      return { Properties: resourceProperties, Error: ShowResourceError.NotAuthorized };
    }
  }
}