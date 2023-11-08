#!/bin/bash
# This script will be called as below
# ./l4s-block-traffic.sh ips "10.0.0.1, 1.1.1.1,..."
#
# uncomment the line bellow to verify:
date      >> /tmp/l4s-block-traffic.txt
echo "$@" >> /tmp/l4s-block-traffic.txt

IPs=$2

# Run any command as you want here, e.g.,
# echo $IPs | ssh root@tata -- python3 block.py

# The output will be shown back to user via Web GUI:
# - stdout will be shown in "blue" banners
# - stderr will be shown in "red" banners
#
# Just an example:
sleep 1
echo "Connected to Tofino switch"
sleep 2
echo "Updated table configuration"
sleep 2
echo "Blocked successfully IPs: $IPs"