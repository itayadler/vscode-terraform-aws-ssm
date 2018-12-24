import * as vscode from 'vscode';
import { getAWSProfiles, readAWSRegionFromConfig } from '../api/aws_api';

export default function createSwitchAWSProfileCmd(context) {
  return vscode.commands.registerCommand('extension.switchAWSProfile', async () => {
    const placeHolder = `Showing AWS profiles found in ~/.aws/credentials. Select current profile:`;
    const selectedAWSProfile = await vscode.window.showQuickPick(getAWSProfiles(), { placeHolder });
    const awsRegion = readAWSRegionFromConfig(selectedAWSProfile);
    if (!awsRegion) {
      return vscode.window.showErrorMessage(`Selected AWSProfile '${selectedAWSProfile}' is missing an AWS region. Add a region to the profile!`);
    }
    context.globalState.update("AWSProfile", selectedAWSProfile || "default");
    vscode.window.showInformationMessage(`AWSProfile changed to '${selectedAWSProfile}'`);
  });
}