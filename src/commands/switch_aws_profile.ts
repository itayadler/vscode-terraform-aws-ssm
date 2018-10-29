import * as vscode from 'vscode';
import { getAWSProfiles } from '../api/aws_api';

export default function createSwitchAWSProfileCmd(context) {
  return vscode.commands.registerCommand('extension.switchAWSProfile', async () => {
    const placeHolder = `Showing AWS profiles found in ~/.aws/credentials. Select current profile:`;
    const selectedAWSProfile = await vscode.window.showQuickPick(getAWSProfiles(), { placeHolder });
    context.globalState.update("AWSProfile", selectedAWSProfile || "default");
  });
}