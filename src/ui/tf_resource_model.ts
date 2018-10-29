export default class TFResource {
  ResourceName: string;
  KeyName: string;
  ResourceType: string;

  constructor(ResourceName, KeyName) {
    this.ResourceName = ResourceName;
    this.KeyName = KeyName;
    [this.ResourceType] = ResourceName.split(".");
  }

  getResourceNameAndKey() {
    return `${this.ResourceName}.${this.KeyName}`;
  }

  getResourceType() {
    return this.ResourceType;
  }

  static createResourceFromString(resourceString: string): TFResource {
    let resourceParts = resourceString.split(".");
    //note(itay): We don't need the last part as it's a key from the resource
    const key = resourceParts.pop();
    return new TFResource(resourceParts.join("."), key);
  }
}