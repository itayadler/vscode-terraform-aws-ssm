'use strict';
import * as vscode from 'vscode';
import SSMKeyCodeLensProvider from './ui/ssm_key_codelens_provider';
import { getAWSProfiles, getSSMParameter, putSSMParameter } from './aws_api';
import { executeTerraformInit } from './tf_state_api';
import { dirname } from 'path';

const documentSelector: vscode.DocumentSelector = [
  { language: "terraform", scheme: "file" },
  { language: "terraform", scheme: "untitled" }
];

export function activate(context: vscode.ExtensionContext) {
  let editSSMKeyCmd = createEditSSMKeyCmd(context);
  let switchAWSProfileCmd = createSwitchAWSProfileCmd(context); 
  let executeTerraformInitCmd = createTerraformInitCmd(context);
  context.subscriptions.push(vscode.languages.registerCodeLensProvider(documentSelector, new SSMKeyCodeLensProvider(context)));
  context.subscriptions.push(switchAWSProfileCmd, editSSMKeyCmd, executeTerraformInitCmd);
}

export function deactivate() {
}

function createTerraformInitCmd(context) {
  return vscode.commands.registerCommand('extension.executeTerraformInit', async() => {
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

function createSwitchAWSProfileCmd(context) {
  return vscode.commands.registerCommand('extension.switchAWSProfile', async () => {
    const selectedAWSProfile = await vscode.window.showQuickPick(getAWSProfiles());
    context.globalState.update("AWSProfile", selectedAWSProfile || "default");
  });
}

function createEditSSMKeyCmd(context) {
  return vscode.commands.registerCommand('extension.editSSMKey', async (ssmKeyPath) => {
    const AWSProfile = context.globalState.get("AWSProfile") as string;
    vscode.window.showInformationMessage(`AWSProfile: ${AWSProfile}; Loading SSM key: ${ssmKeyPath}`);
    let Parameter = null, parameterValue = null;
    try {
      const result = await getSSMParameter(AWSProfile, { Name: ssmKeyPath, WithDecryption: true });
      Parameter = result.Parameter;
      parameterValue = Parameter.Value;
    } catch(ex) {
      if (ex.code === "ParameterNotFound") {
        parameterValue = "";
      } else {
        vscode.window.showErrorMessage(`Failed to get SSM Parameter in path ${ssmKeyPath}. Make sure you've selected the correct AWSProfile.`);
        return;
      }
    }
    const newValue = await vscode.window.showInputBox({ value: parameterValue });
    if (!!newValue && newValue !== parameterValue) {
      await putSSMParameter(AWSProfile, {
        Name: ssmKeyPath,
        Overwrite: true,
        Value: newValue,
        Type: (Parameter && Parameter.Type) || "SecureString" //note(itay): Should make this configurable.
      });
      vscode.window.showInformationMessage(`Saved SSM key: ${ssmKeyPath} successfully`);
    }
  });
}