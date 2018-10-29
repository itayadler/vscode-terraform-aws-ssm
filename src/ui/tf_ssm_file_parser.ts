import { AstItem, AstList } from '../vendor/tf_ast';
import { parseHcl } from '../vendor/hcl-hil/hcl-hil-wrapper';
import SSMKey from './ssm_key_model';

export function extractSSMKeysFromFile(filePath: string, document: string): SSMKey[] {
  const [ast] = parseHcl(document);
  return ast.Node.Items
    .filter(filterAWSSSMParameterKey)
    .map(mapAWSSSMKey.bind(filePath));
}

function mapAWSSSMKey(item: AstItem): SSMKey {
  const list = item.Val.List as AstList;
  const [nameItem] = list.Items
    .filter((item: AstItem) => item.Keys.length === 1 && item.Keys[0].Token.Text === 'name');
  return new SSMKey(
    this,
    nameItem.Val.Token.Text.replace(new RegExp('"', 'g'), '').replace(new RegExp("'", 'g'), ''),
    item.Keys[0].Token.Pos.Line - 1,
    item.Keys[0].Token.Pos.Column,
    item.Keys[0].Token.Pos.Offset
  );
}

function filterAWSSSMParameterKey(item: AstItem): boolean {
  return item.Keys.length === 3 &&
    item.Keys[0].Token.Type === 4 && item.Keys[0].Token.Text.indexOf('data') > -1 &&
    item.Keys[1].Token.Type === 9 && item.Keys[1].Token.Text.indexOf('aws_ssm_parameter') > -1;
}