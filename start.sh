#!/bin/bash

start_time=$(date +%s)

banner()
{
  echo "+------------------------------------------+"
  printf "| %-40s |\n" "`date`"
  echo "|                                          |"
  printf "|`tput bold` %-40s `tput sgr0`|\n" "$@"
  echo "+------------------------------------------+"
}

if [ -z "$BASE_DIR" ]
then
  export BASE_DIR=$(pwd)
fi

banner "Build web"
cd $BASE_DIR/visor
npm install
NODE_ENV=production npm run build

banner "Terraform Init"
cd $BASE_DIR/deploy/terraform
terraform init -upgrade

banner "Terraform Apply"
terraform apply -auto-approve

sleep 2

banner "Ansible Provisioning"
export ANSIBLE_HOST_KEY_CHECKING=False
export ANSIBLE_NOCOWS=1
ansible-playbook -i ./generated/server.ini ../ansible/server.yaml \
  --extra-vars "@generated/backend_params.json"

banner "Output"
terraform output

cd $BASE_DIR

end_time=$(date +%s)
elapsed=$(( end_time - start_time ))
echo "Time: $elapsed sec"