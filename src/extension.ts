'use strict';
import * as vscode from 'vscode';
import SSMKeyCodeLensProvider from './ui/ssm_key_codelens_provider';
import createEditSSMKeyCmd from './commands/edit_ssm_key';
import createSwitchAWSProfileCmd from './commands/switch_aws_profile';
import createTerraformInitCmd from './commands/execute_terraform_init';

const documentSelector: vscode.DocumentSelector = [
  { language: "terraform", scheme: "file" },
  { language: "terraform", scheme: "untitled" }
];

export function activate(context: vscode.ExtensionContext) {
  const editSSMKeyCmd = createEditSSMKeyCmd(context);
  const switchAWSProfileCmd = createSwitchAWSProfileCmd(context);
  const executeTerraformInitCmd = createTerraformInitCmd(context);
  context.subscriptions.push(vscode.languages.registerCodeLensProvider(documentSelector, new SSMKeyCodeLensProvider(context)));
  context.subscriptions.push(switchAWSProfileCmd, editSSMKeyCmd, executeTerraformInitCmd);
}

export function deactivate() {
}
