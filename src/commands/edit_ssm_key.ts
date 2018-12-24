import * as vscode from 'vscode';
import { getSSMParameter, putSSMParameter } from '../api/aws_api';

export default function createEditSSMKeyCmd(context) {
  return vscode.commands.registerCommand('extension.editSSMKey', async (ssmKeyPath) => {
    const AWSProfile = context.globalState.get("AWSProfile") as string;
    const placeholder = `Current AWSProfile is \`${AWSProfile}\`. Continue?`;
    const continueInCurrentProfile = await vscode.window.showQuickPick(['Yes', 'No'], { placeHolder: placeholder });
    if (continueInCurrentProfile === 'No') {
      return;
    }
    vscode.window.showInformationMessage(`AWSProfile: ${AWSProfile}; Loading SSM key: ${ssmKeyPath}`);
    let Parameter = null, parameterValue = null, doesKeyExist = true;
    try {
      const result = await getSSMParameter(AWSProfile, { Name: ssmKeyPath, WithDecryption: true });
      Parameter = result.Parameter;
      parameterValue = Parameter.Value;
    } catch (ex) {
      if (ex.code === "ParameterNotFound") {
        parameterValue = "";
        doesKeyExist = false;
      } else {
        vscode.window.showErrorMessage(`Failed to get SSM Parameter in path ${ssmKeyPath}. Make sure you've selected the correct AWSProfile.`);
        return;
      }
    }
    const editParamPlaceholder = `Enter a value for SSM path ${ssmKeyPath}`;
    if (doesKeyExist) {
      const newValue = await vscode.window.showInputBox({ value: parameterValue, placeHolder: editParamPlaceholder });
      editKey(parameterValue, newValue, AWSProfile, ssmKeyPath, Parameter.Type);
    } else {
      const placeholder = `Choose an SSM key type for the key path: ${ssmKeyPath}`;
      const userPickedSSMKeyType = await vscode.window.showQuickPick(['SecureString', 'String', 'StringList'], { placeHolder: placeholder });
      const newValue = await vscode.window.showInputBox({ value: parameterValue, placeHolder: editParamPlaceholder });
      editKey(parameterValue, newValue, AWSProfile, ssmKeyPath, userPickedSSMKeyType);
    }
  });
}

async function editKey(oldValue, newValue, AWSProfile, ssmKeyPath, ssmKeyType) {
  if (newValue && newValue !== oldValue) {
    const confirmPlaceholder = `Are you sure you want to change \`${oldValue}\` to \`${newValue}\`?`;
    const confirmResult = await vscode.window.showQuickPick(['Yes', 'No'], { placeHolder: confirmPlaceholder });
    if (confirmResult === "Yes") {
      await putSSMParameter(AWSProfile, {
        Name: ssmKeyPath,
        Overwrite: true,
        Value: newValue,
        Type: ssmKeyType
      });
      vscode.window.showInformationMessage(`Saved SSM key: ${ssmKeyPath} successfully`);
    }
  }
}
