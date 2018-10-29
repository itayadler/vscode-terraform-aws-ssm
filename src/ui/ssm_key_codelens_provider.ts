import * as vscode from 'vscode';
import { extractSSMKeysFromFile } from './tf_ssm_file_parser';
import SSMKey from './ssm_key_model';
import TFLocalResourceCache from './tf_local_resource_cache';
import { TerraformError } from '../api/tf_state_api';
import TFResource from './tf_resource_model';

class SSMKeyCodeLens extends vscode.CodeLens {

  constructor(
    private ssmKey: SSMKey,
    range: vscode.Range,
    command?: vscode.Command
  ) {
    super(range, command);
  }

  async createCommand(cache: TFLocalResourceCache, awsProfile: string): Promise<vscode.Command> {
    const ssmKeyPath = await this.ssmKey.getPath(cache, awsProfile);
    if (ssmKeyPath.Error) {
      this.handleResourceError(ssmKeyPath.Resource, ssmKeyPath.Error, awsProfile);
      return Promise.reject(ssmKeyPath.Error);
    }

    return Promise.resolve({
      command: 'extension.editSSMKey',
      title: 'Edit SSM Key',
      arguments: [ssmKeyPath.Path]
    } as vscode.Command);
  }

  handleResourceError(resource: TFResource, error: TerraformError, awsProfile: string) {
    if (error === TerraformError.NoTerraformInstalled) {
      vscode.window.showErrorMessage(`The extension vscode-terraform-aws-ssm must have terraform CLI installed to work properly`);
    } else if (error === TerraformError.FailedToLoadBackend) {
      vscode.window.showErrorMessage(`You must run terraform init on the directory in order for Edit SSM Key to work`);
    } else if (error === TerraformError.EmptyResponse) {
      vscode.window.showErrorMessage(`terraform state show ${resource.ResourceName} returned an empty response`);
    } else if (error === TerraformError.UnsupportedResourceType) {
      vscode.window.showErrorMessage(`Unsupported ResourceType '${resource.ResourceType}'. Only 'data' resource is supported.`);
    } else {
      vscode.window.showErrorMessage(`Current profile ${awsProfile} has no permissions to load terraform state.`);
    }
  }
}

export default class SSMKeyCodeLensProvider implements vscode.CodeLensProvider {
  private extensionContext: vscode.ExtensionContext;

  constructor(_extensionContext) {
    this.extensionContext = _extensionContext;
  }

  async provideCodeLenses(document: vscode.TextDocument, _token: vscode.CancellationToken): Promise<vscode.CodeLens[] | null> {
    const ssmKeys = extractSSMKeysFromFile(document.fileName, document.getText());
    return ssmKeys.map((ssmKey: SSMKey) => {
      const start = new vscode.Position(ssmKey.Line, ssmKey.Column);
      const end = new vscode.Position(ssmKey.Line, ssmKey.Offset);
      return new SSMKeyCodeLens(ssmKey, new vscode.Range(start, end));
    });
  }

  resolveCodeLens?(codeLens: vscode.CodeLens, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens> {
    const awsProfile = this.extensionContext.globalState.get("AWSProfile") as string;
    let ssmKeyCodeLens = codeLens as SSMKeyCodeLens;
    const localResourceCache = new TFLocalResourceCache(this.extensionContext.globalState);
    return ssmKeyCodeLens.createCommand(localResourceCache, awsProfile)
      .then((command) => {
        ssmKeyCodeLens.command = command;
        return ssmKeyCodeLens;
      });
  }
}