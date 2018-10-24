# vscode-terraform-aws-ssm README

This extension let's you easily view/edit SSM keys right in your terraform files. It detects
usage of `aws_ssm_parameter` and augments an Edit SSM Key command on top of each key it 
finds in a file.

# prequisites 

- You need to have terraform CLI installed.
- You need to have a `~/.aws/credentials` file under your home directory with all the AWS profiles
required for you to access the different SSM parameters and states of your services.

# Caveats

- Only tested on Ubuntu/Mac OS X.