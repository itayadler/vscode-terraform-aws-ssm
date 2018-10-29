import * as vscode from 'vscode';
import { dirname } from 'path';
import { executeTerraformInit } from '../api/tf_state_api';

export default function createTerraformInitCmd(context) {
  return vscode.commands.registerCommand('extension.executeTerraformInit', async () => {
    const AWSProfile = context.globalState.get("AWSProfile") as string;
    const workingDirectory = dirname(vscode.window.activeTextEditor.document.fileName);
    vscode.window.showInformationMessage(`Running terraform init in current document directory: ${workingDirectory}`);
    const result = await executeTerraformInit(workingDirectory, AWSProfile);
    if (result) {
      vscode.window.showErrorMessage("Failed to run `terraform init`. Either an authorization issue or failed to load one of the providers");
      return;
    }
    vscode.window.showInformationMessage(`Completed \`terraform init\` execution successfully: ${workingDirectory}`);
  });
}