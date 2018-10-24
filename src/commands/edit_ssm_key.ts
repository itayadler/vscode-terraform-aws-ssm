import * as vscode from 'vscode';
import { getSSMParameter, putSSMParameter } from '../aws_api';

export default function createEditSSMKeyCmd(context) {
  return vscode.commands.registerCommand('extension.editSSMKey', async (ssmKeyPath) => {
    const AWSProfile = context.globalState.get("AWSProfile") as string;
    vscode.window.showInformationMessage(`AWSProfile: ${AWSProfile}; Loading SSM key: ${ssmKeyPath}`);
    let Parameter = null, parameterValue = null;
    try {
      const result = await getSSMParameter(AWSProfile, { Name: ssmKeyPath, WithDecryption: true });
      Parameter = result.Parameter;
      parameterValue = Parameter.Value;
    } catch (ex) {
      if (ex.code === "ParameterNotFound") {
        parameterValue = "";
      } else {
        vscode.window.showErrorMessage(`Failed to get SSM Parameter in path ${ssmKeyPath}. Make sure you've selected the correct AWSProfile.`);
        return;
      }
    }
    const newValue = await vscode.window.showInputBox({ value: parameterValue });
    if (!!newValue && newValue !== parameterValue) {
      const confirmPlaceholder = `Are you sure you want to change \`${parameterValue}\` to \`${newValue}\`?`;
      const confirmResult = await vscode.window.showQuickPick(['Yes', 'No'], { placeHolder: confirmPlaceholder });
      if (confirmResult === "Yes") {
        await putSSMParameter(AWSProfile, {
          Name: ssmKeyPath,
          Overwrite: true,
          Value: newValue,
          Type: (Parameter && Parameter.Type) || "SecureString" //note(itay): Should make this configurable.
        });
        vscode.window.showInformationMessage(`Saved SSM key: ${ssmKeyPath} successfully`);
      }
    }
  });
}
