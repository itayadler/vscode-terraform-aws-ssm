# 0.2.0
Bug fixes:
- Showing only one error message when the extension fails to load SSM path state from terraform.
- Allow to create a new key in case it doesn't exist, by default all keys are of type `SecureString`.

Features:
- Add `terraform init` command to run in the current document working directory.
- Edit confirmation for `Edit SSM Key` command.

# 0.1.0
Initial version.

Features:
- `Edit SSM Key`: A codelens flavored command that popups over a `aws_ssm_parameter`, allowing 
you to inline edit a SSM key.
- `Switch AWS Profile`: Switch the AWS Profile in all the background commands the extension
runs. (`terraform state show resource` and AWS API calls). Assumes you've under your
home directory ~/.aws/credentials.