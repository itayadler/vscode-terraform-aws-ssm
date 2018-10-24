'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import SSMKeyCodeLensProvider from './ui/ssm_key_codelens_provider';
import { getAWSProfiles, getSSMParameter, putSSMParameter } from './aws_api';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let editSSMKeyCmd = vscode.commands.registerCommand('extension.editSSMKey', async (ssmKeyPath) => {
    const AWSProfile = context.globalState.get("AWSProfile") as string;
    const { Parameter } = await getSSMParameter(AWSProfile, { Name: ssmKeyPath, WithDecryption: true });
    const newValue = await vscode.window.showInputBox({ value: Parameter.Value });
    if (newValue !== Parameter.Value) {
      await putSSMParameter(AWSProfile, {
        Name: ssmKeyPath,
        Overwrite: true,
        Value: newValue,
        Type: Parameter.Type
      });
    }
  });
  let switchAWSProfile = vscode.commands.registerCommand('extension.switchAWSProfile', async () => {
    // const param = await getParameter("insights-prod", { Name: ssmKeyPath, WithDecryption: true });
    // vscode.window.showInputBox({ value: ssmKeyPath });
    const selectedAWSProfile = await vscode.window.showQuickPick(getAWSProfiles());
    context.globalState.update("AWSProfile", selectedAWSProfile || "insights-prod");
  });

  context.subscriptions.push(switchAWSProfile, editSSMKeyCmd, new SSMKeyCodeLensProvider(context));
}

// this method is called when your extension is deactivated
export function deactivate() {
}