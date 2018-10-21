data "aws_ssm_parameter" "key_one" {
  name = "/${data.terraform_remote_state.vpc.env}/${data.terraform_remote_state.vpc.region}/some-service/key_one"
}

data "aws_ssm_parameter" "key_two" {
  name = "/${data.terraform_remote_state.vpc.env}/${data.terraform_remote_state.vpc.region}/some-service/key_two"
}

module "ssm_env_variables" {
  source = "git@github.com:somewhere/overtherainbow.git//ssm_env_variables"

  ssm_env_variables_list = [
    {
      "name"  = "KEY_ONE"
      "value" = "${data.aws_ssm_parameter.key_one.value}"
    },
    {
      "name"  = "KEY_TWO"
      "value" = "${data.aws_ssm_parameter.key_two.value}"
    },
  ]
}
