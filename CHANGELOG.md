# 0.3.1
- Fix bad state after `terraform init` where resource can't
be fetched.
- Add create flow for a key with selection of SSM Key Type.
- Update README.md with demo.gif

# 0.2.5
- Add known issues to the project README.
- Change Edit SSM Key position to be on top of `aws_ssm_parameter`.
- Major refactor to codelens provider, fixed codelens to update
on each change to the file.

# 0.2.2
Fixes:
- `Edit SSM Key`: Add confirmation UI.

# 0.2.1
- Major bug fix for terraform init / terraform state load

# 0.2.0
Bug fixes:
- Showing only one error message when the extension fails to load SSM path state from terraform.
- Allow to create a new key in case it doesn't exist, by default all keys are of type `SecureString`.

Features:
- Add `terraform init` command to run in the current document working directory.

# 0.1.0
Initial version.

Features:
- `Edit SSM Key`: A codelens flavored command that popups over a `aws_ssm_parameter`, allowing 
you to inline edit a SSM key.
- `Switch AWS Profile`: Switch the AWS Profile in all the background commands the extension
runs. (`terraform state show resource` and AWS API calls). Assumes you've under your
home directory ~/.aws/credentials.