import { AstItem, AstList } from './ast';
const { parseHcl } = require('./hcl-hil/hcl-hil-wrapper');

export interface SSMKeyInFile {
  Path: string;
  Line: number;
  Column: number;
  Offset: number;
}

export function extractSSMKeysFromFile(fileString: string): SSMKeyInFile[] {
  const [ast] = parseHcl(fileString);
  return ast.Node.Items
    .filter(filterAWSSSMParameterKey)
    .map(mapAWSSSMKey);
}

function mapAWSSSMKey(item: AstItem): SSMKeyInFile {
  const list = item.Val.List as AstList;
  const [nameItem] = list.Items
    .filter((item: AstItem) => item.Keys.length === 1 && item.Keys[0].Token.Text === 'name');
  return {
    Path: nameItem.Val.Token.Text,
    Line: nameItem.Val.Token.Pos.Line,
    Column: nameItem.Val.Token.Pos.Column,
    Offset: nameItem.Val.Token.Pos.Offset
  }
}

function filterAWSSSMParameterKey(item: AstItem): boolean {
  return item.Keys.length === 3 &&
    item.Keys[0].Token.Type === 4 && item.Keys[0].Token.Text.indexOf('data') > -1 &&
    item.Keys[1].Token.Type === 9 && item.Keys[1].Token.Text.indexOf('aws_ssm_parameter') > -1;
}