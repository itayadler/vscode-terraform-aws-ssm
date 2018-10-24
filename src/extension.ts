'use strict';
import * as vscode from 'vscode';
import SSMKeyCodeLensProvider from './ui/ssm_key_codelens_provider';
import { getAWSProfiles, getSSMParameter, putSSMParameter } from './aws_api';

const documentSelector: vscode.DocumentSelector = [
  { language: "terraform", scheme: "file" },
  { language: "terraform", scheme: "untitled" }
];

export function activate(context: vscode.ExtensionContext) {
  let editSSMKeyCmd = vscode.commands.registerCommand('extension.editSSMKey', async (ssmKeyPath) => {
    const AWSProfile = context.globalState.get("AWSProfile") as string;
    vscode.window.showInformationMessage(`AWSProfile: ${AWSProfile}; Loading SSM key: ${ssmKeyPath}`);
    let Parameter = null;
    try {
      const result = await getSSMParameter(AWSProfile, { Name: ssmKeyPath, WithDecryption: true });
      Parameter = result.Parameter;
    } catch(ex) {
      vscode.window.showErrorMessage(`Failed to get SSM Parameter in path ${ssmKeyPath}. Make sure you've selected the correct AWSProfile.`);
      return;
    }
    const newValue = await vscode.window.showInputBox({ value: Parameter.Value });
    if (!!newValue && newValue !== Parameter.Value) {
      await putSSMParameter(AWSProfile, {
        Name: ssmKeyPath,
        Overwrite: true,
        Value: newValue,
        Type: Parameter.Type
      });
      vscode.window.showInformationMessage(`Saved SSM key: ${ssmKeyPath} successfully`);
    }
  });
  let switchAWSProfile = vscode.commands.registerCommand('extension.switchAWSProfile', async () => {
    const selectedAWSProfile = await vscode.window.showQuickPick(getAWSProfiles());
    context.globalState.update("AWSProfile", selectedAWSProfile || "default");
  });

  context.subscriptions.push(vscode.languages.registerCodeLensProvider(documentSelector, new SSMKeyCodeLensProvider(context)));
  context.subscriptions.push(switchAWSProfile, editSSMKeyCmd);
}

export function deactivate() {
}