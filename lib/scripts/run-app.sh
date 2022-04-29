#!/bin/bash
yum update -y

sudo amazon-linux-extras install docker

sudo service docker start

sudo usermod -a -G docker ec2-user

aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 061155101849.dkr.ecr.us-west-2.amazonaws.com/pillars-app

docker pull 061155101849.dkr.ecr.us-west-2.amazonaws.com/pillars-app:latest

docker run --name search -p 80:3000 061155101849.dkr.ecr.us-west-2.amazonaws.com/pillars-app