'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import SSMKeyCodeLensProvider from './ui/ssm_key_codelens_provider';
import { getParameter } from './aws_ssm_api';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.editSSMKey', (argName, ssmKeyPath) => {
    // const param = await getParameter("insights-prod", { Name: ssmKeyPath, WithDecryption: true });
    vscode.window.showInputBox({ value: ssmKeyPath });
  });

  context.subscriptions.push(disposable, new SSMKeyCodeLensProvider());
}

// this method is called when your extension is deactivated
export function deactivate() {
}