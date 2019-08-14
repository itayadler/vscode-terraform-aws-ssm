import { parse } from 'ini';
import * as shell from 'shelljs';
import TFResource from '../ui/tf_resource_model';
import TFLocalResourceCache from '../ui/tf_local_resource_cache';

let showResourcePromises = {};

export enum TerraformError {
  None,
  NoTerraformInstalled,
  NotAuthorized,
  FailedToLoadBackend,
  UnsupportedResourceType,
  EmptyResponse
}

export interface ShowResourceResult {
  Properties: object;
  Error?: TerraformError;
  Resource: TFResource;
}

function shellType(programName) {
  return new Promise((resolve,reject)=> {
    shell.exec(`type ${programName}`, (code, stdout, stderr)=> {
      if (code === 0) {
        resolve();
      } else {
        reject();
      }
    });
  });
}

export function executeTerraformInit(workingDirectory, awsProfile = "default") {
  shell.cd(workingDirectory);
  shell.env["AWS_PROFILE"] = awsProfile;
  return new Promise((resolve, reject) => {
    shellType('terraform').then(()=> {
      shell.exec(`terraform init`, (code, stdout, stderr) => {
        if (code !== 0) {
          resolve(TerraformError.NotAuthorized);
        } else {
          resolve(null);
        }
      });
    }).catch(()=> {
      resolve(TerraformError.NoTerraformInstalled);
    });
  });
}

export function showResource(resource: TFResource, cache: TFLocalResourceCache, workingDirectory, awsProfile = "default"): Promise<ShowResourceResult> {
  let showResourcePromise = showResourcePromises[resource.ResourceName];
  if (showResourcePromise) {
    return showResourcePromise;
  }

  return showResourcePromises[resource.ResourceName] = new Promise<ShowResourceResult>((resolve, reject) => {
    const cachedResourceProperties = cache.get<object>(resource.getKeyForCache(awsProfile));
    if (cachedResourceProperties && Object.keys(cachedResourceProperties).length > 0) {
      return resolve({
        Properties: cachedResourceProperties, Resource: resource
      });
    }

    const resourceProperties = {};
    if (!shell.which('terraform')) {
      return resolve({
        Properties: resourceProperties, Error: TerraformError.NoTerraformInstalled, Resource: resource
      });
    }
    if (resource.ResourceType !== 'data') {
      return resolve({
        Properties: resourceProperties, Error: TerraformError.UnsupportedResourceType,
        Resource: resource
      });
    }
    shell.cd(workingDirectory);
    // shell.env["TF_LOG"] = "TRACE";
    shell.env["AWS_PROFILE"] = awsProfile;
    return new Promise<ShowResourceResult>((resolve, reject) => {
      shell.exec(`terraform state show ${resource.ResourceName}`, (code, stdout, stderr) => {
        if (code === 0) {
          if (!stdout) {
            delete showResourcePromises[resource.ResourceName];
            return resolve({
              Properties: resourceProperties, Error: TerraformError.EmptyResponse,
              Resource: resource
            });
          }
          const iniProperties = parse(stdout);
          Object.keys(iniProperties)
            .forEach(key => resourceProperties[key] = iniProperties[key]);
          cache.set<object>(resource.getKeyForCache(awsProfile), resourceProperties);
          delete showResourcePromises[resource.ResourceName];
          resolve({ Properties: resourceProperties, Resource: resource });
        } else {
          if (stderr.toString().indexOf("Failed to load backend") > -1) {
            delete showResourcePromises[resource.ResourceName];
            resolve({
              Properties: resourceProperties, Error: TerraformError.FailedToLoadBackend,
              Resource: resource
            });
          } else if (stderr.toString().indexOf("Failed to load state: AccessDenied") > -1) {
            delete showResourcePromises[resource.ResourceName];
            resolve({
              Properties: resourceProperties, Error: TerraformError.NotAuthorized,
              Resource: resource
            });
          }
        }
      });
    }).then((result) => resolve(result));
  });
}