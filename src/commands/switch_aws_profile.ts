import * as vscode from 'vscode';
import { getAWSProfiles } from '../api/aws_api';

export default function createSwitchAWSProfileCmd(context) {
  return vscode.commands.registerCommand('extension.switchAWSProfile', async () => {
    const selectedAWSProfile = await vscode.window.showQuickPick(getAWSProfiles());
    context.globalState.update("AWSProfile", selectedAWSProfile || "default");
  });
}