#!/bin/bash
# This script will be called as below
# ./l4s-unblock-traffic.sh ips "10.0.0.1,1.1.1.1,..."
#
# uncomment the line bellow to verify:
date >> /tmp/l4s-unblock-traffic.log
echo "$@" >> /tmp/l4s-unblock-traffic.log


IPs=$2

# Run any command as you want here, e.g.,
# echo $IPs | ssh root@tata -- python3 unblock.py

# the output will be shown back to user via Web GUI
echo "table_delete tb_blocklist 0" | simple_switch_CLI | tee -a /tmp/l4s-unblock-traffic.log
echo "Unblocked successfully IPs: $IPs"