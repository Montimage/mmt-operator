#!/bin/bash

pwd

PORT=22

TARGET=/home/server10g/huunghia/mmt-operator
USER=server10g
IP=192.168.0.7

TARGET=/home/mmt/mmt/mmt-operator
USER=mmt
PORT=2222
IP=localhost

TARGET=mmt/mmt-operator
USER=epc
IP=192.168.0.192
PORT=22



#PORT=22
#IP=192.168.0.220
#USER=epc
#TARGET=/home/epc/mmt/mmt-operator

#USER=montimage
#IP=192.168.0.194

#TARGET=/home/montimage/mmt-operator
#USER=montimage
#PORT=22
#IP=192.168.0.210

#TARGET=/home/montimage/mmt-operator
#USER=montimage
#IP=localhost
#PORT=2233

#rsync -e "ssh -i /Users/nhnghia/.ssh/id_rsa -p $PORT" -rca ./* .git $USER@$IP:$TARGET

#TARGET=/home/server10ga/huunghia/mmt-operator/
#USER=root
#IP=192.168.0.36
#PORT=22

rsync -av --progress -e "ssh -i /Users/nhnghia/.ssh/id_rsa -p $PORT"  --exclude /www/public/db_backup  --exclude /www/dist  --exclude /.git -rca ./ $USER@$IP:$TARGET
