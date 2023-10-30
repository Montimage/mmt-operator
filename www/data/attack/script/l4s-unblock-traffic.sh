#!/bin/bash
# This script will be called as below
# ./l4s-unblock-traffic.sh ips "10.0.0.1,1.1.1.1,..."
#
# uncomment the line bellow to verify:
# echo "$@" > /tmp/l4s-unblock-traffic.txt


IPs=$2

# Run any command as you want here, e.g.,
# echo $IPs | ssh root@tata -- python3 unblock.py

# the output will be shown back to user via Web GUI
echo "Unblocked successfully IPs: $IPs"