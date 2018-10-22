import * as vscode from 'vscode';
import { extractSSMKeysFromFile } from '../tf_ssm_file_parser';

export default class SSMKeyCodeLensProvider implements vscode.CodeLensProvider, vscode.Disposable {
  private codeLensRegistrationHandle?: vscode.Disposable | null;

  constructor() {
    this.registerCodeLensProvider();
  }

  dispose() {
    if (this.codeLensRegistrationHandle) {
      this.codeLensRegistrationHandle.dispose();
      this.codeLensRegistrationHandle = null;
    }
  }

  async provideCodeLenses(document: vscode.TextDocument, _token: vscode.CancellationToken): Promise<vscode.CodeLens[] | null> {
    let items: vscode.CodeLens[] = [];
    const ssmKeys = extractSSMKeysFromFile(document.getText());
    ssmKeys.forEach(key => {
      let editSSMKey: vscode.Command = {
        command: 'extension.editSSMKey',
        title: 'Edit SSM Key',
        arguments: ['key-path', key.Path]
      };
      const start = new vscode.Position(key.Line, key.Column);
      const end = new vscode.Position(key.Line, key.Offset);
      items.push(
        new vscode.CodeLens(new vscode.Range(start, end), editSSMKey),
      );
    });

    return items;
  }

  private registerCodeLensProvider() {
    this.codeLensRegistrationHandle = vscode.languages.registerCodeLensProvider([
      { scheme: 'file' },
      { scheme: 'untitled' },
    ], this);
  }
}