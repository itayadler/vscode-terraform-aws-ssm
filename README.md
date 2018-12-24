# VSCode Terraform AWS SSM

![VSCode Terraform AWS SSM](https://raw.githubusercontent.com/itayadler/vscode-terraform-aws-ssm/master/demo.gif)

add/view/edit SSM keys right in your terraform files. The extension detects
usage of `aws_ssm_parameter` and augments an Add/Edit SSM Key command on top of each key it
finds in a file.

# Features

- Add/Edit SSM Key
- Switch AWS profiles command (based on `~/.aws/credentials`)
- Execute `terraform init` command in current file working directory.

# Prequisites

- You need to have the terraform VSCode extension installed. (TODO: Add as an extension dependency)
- You need to have terraform CLI installed.
- You need to have a `~/.aws/credentials` file under your home directory with all the AWS profiles
required for you to access the different SSM parameters and states of your services.
NOTE: The AWS region is also required to be set for each profile.

# Caveats/Issues

- Only tested on Ubuntu/Mac OS X.
- Known issue: Sometimes `terraform state show resource` that's used to fill up `data.*` resources
returns an empty response.
