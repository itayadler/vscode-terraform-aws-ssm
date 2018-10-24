import * as vscode from 'vscode';
import { extractSSMKeysFromFile } from '../tf_ssm_file_parser';
import { showResource, ShowResourceResult } from '../tf_state_api';
import { dirname } from 'path';
import * as bluebird from 'bluebird';

// note(itay): a TFResource is something like data.some_place.some_key
// the ResourceName is all apart of some_key and KeyName is some_key
interface TFResource {
  ResourceName: string;
  KeyName: string;
}

async function enrichSSMKeyPath(path, document, awsProfile, extensionContext) {
  const resourceKeyParts = await bluebird.map(path.split("/"), async resourceInPath => {
    if (resourceInPath.indexOf("$") > -1) {
      const leftBracketIndex = resourceInPath.indexOf("{");
      const rightBracketIndex = resourceInPath.indexOf("}");
      const resourceString = resourceInPath.slice(leftBracketIndex + 1, rightBracketIndex);
      const resource = getResourceFromResourceString(resourceString);
      const resourceKeyValue = await getAndSetValueFromResource(resource, document, awsProfile, extensionContext);
      return resourceKeyValue;
    } else {
      return resourceInPath;
    }
  }, { concurrency: 1 });
  return resourceKeyParts.join("/")
}

async function getAndSetValueFromResource(resource: TFResource, document, awsProfile, extensionContext) {
  const storeInKey = `${resource.ResourceName}.${resource.KeyName}`;
  let storeValue = extensionContext.globalState.get(storeInKey);
  if (!storeValue) {
    const resourceObj: ShowResourceResult = await showResource(resource.ResourceName, dirname(document.fileName), awsProfile);
    storeValue = resourceObj.Properties.get(resource.KeyName);
    extensionContext.globalState.update(storeInKey, storeValue);
  }
  return storeValue;
}

function getResourceFromResourceString(resourceString) {
  let resourceParts = resourceString.split(".");
  //note(itay): We don't need the last part as it's a key from the resource
  const key = resourceParts.pop();
  //note(itay): We don't need the first part as it's the data scope in TF.
  // resourceParts.shift();
  return { ResourceName: resourceParts.join("."), KeyName: key };
}

export default class SSMKeyCodeLensProvider implements vscode.CodeLensProvider, vscode.Disposable {
  private codeLensRegistrationHandle?: vscode.Disposable | null;
  private extensionContext: vscode.ExtensionContext;

  constructor(_extensionContext) {
    this.extensionContext = _extensionContext;
    this.registerCodeLensProvider();
  }

  dispose() {
    if (this.codeLensRegistrationHandle) {
      this.codeLensRegistrationHandle.dispose();
      this.codeLensRegistrationHandle = null;
    }
  }

  async provideCodeLenses(document: vscode.TextDocument, _token: vscode.CancellationToken): Promise<vscode.CodeLens[] | null> {
    let items: vscode.CodeLens[] = [];
    const ssmKeys = extractSSMKeysFromFile(document.getText());
    await bluebird.map(ssmKeys, async key => {
      const AWSProfile = this.extensionContext.globalState.get("AWSProfile") as string;
      const enrichSSMKeyValue = await enrichSSMKeyPath(key.Path, document, AWSProfile, this.extensionContext);
      let editSSMKey: vscode.Command = {
        command: 'extension.editSSMKey',
        title: 'Edit SSM Key',
        arguments: [enrichSSMKeyValue]
      };
      const start = new vscode.Position(key.Line, key.Column);
      const end = new vscode.Position(key.Line, key.Offset);
      items.push(
        new vscode.CodeLens(new vscode.Range(start, end), editSSMKey),
      );
    }, { concurrency: 1 });

    return items;
  }

  private registerCodeLensProvider() {
    this.codeLensRegistrationHandle = vscode.languages.registerCodeLensProvider([
      { scheme: 'file' },
      { scheme: 'untitled' },
    ], this);
  }
}