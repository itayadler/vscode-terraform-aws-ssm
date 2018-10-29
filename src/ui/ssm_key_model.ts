import * as bluebird from 'bluebird';
import TFResource from "./tf_resource_model";
import TFLocalResourceCache from "./tf_local_resource_cache";
import { showResource, ShowResourceResult, TerraformError } from '../api/tf_state_api';
import { dirname } from 'path';

export interface SSMKeyPath {
  Path: string;
  Resource?: TFResource;
  Error?: TerraformError;
}

export default class SSMKey {
  FilePath: string;
  RawPath: string;
  Line: number;
  Column: number;
  Offset: number;
  Resources: TFResource[];

  constructor(filePath: string, path: string, line: number, column: number, offset: number) {
    this.RawPath = path;
    this.Line = line;
    this.Column = column;
    this.Offset = offset;
    this.FilePath = filePath;
    this.Resources = this.getResources(this.RawPath);
  }

  private getResources(path): TFResource[] {
    return path.split("/")
      .filter(this.isPathPartResource)
      .map(this.getResource);
  }

  private isPathPartResource(pathPart) {
    return pathPart.indexOf("$") > -1;
  }

  private getResource(pathPart) {
    const leftBracketIndex = pathPart.indexOf("{");
    const rightBracketIndex = pathPart.indexOf("}");
    const resourceString = pathPart.slice(leftBracketIndex + 1, rightBracketIndex);
    return TFResource.createResourceFromString(resourceString);
  }

  async getPath(cache: TFLocalResourceCache, awsProfile: string): Promise<SSMKeyPath> {
    const showResourceResults: ShowResourceResult[] = await bluebird
      .map(this.Resources, async (resource) => {
        return await showResource(resource, cache, dirname(this.FilePath), awsProfile);
      }, { concurrency: 1 });

    const resourceWithError = showResourceResults.find((showResource) => !!showResource.Error);
    if (resourceWithError) {
      return { Path: null, Error: resourceWithError.Error, Resource: resourceWithError.Resource };
    }
    const resourceKeyParts = this.RawPath.split("/").map((pathPart, index) => {
      if (this.isPathPartResource(pathPart)) {
        const resource = this.getResource(pathPart);
        const showResourceResult = showResourceResults.find((showResourceResult) =>
          showResourceResult.Resource.ResourceName === resource.ResourceName);
        return showResourceResult.Properties[resource.KeyName];
      } else {
        return pathPart;
      }
    });

    return { Path: resourceKeyParts.join("/") };
  }
}