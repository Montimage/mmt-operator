#!/usr/bin/env python
#This python script is to generate the traffic for testing all MMT rules
#Command: sudo python attacks_all.py [property id of the rule]
# Description:
# Attempted to connect via ssh but reseted immediately. Source address is spoofed, infected machine or attacker"
# Execution:
# Open a terminal with root and run the following command:
# python 2.ssh-reset.py"

from scapy.all import *
from struct import pack
from struct import unpack
from random import randint
import os, sys, socket, argparse
import urllib3
import binascii


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument("--ipDest", help="Specify Target Host")
    parser.add_argument("--ipSrc",  help="Specify Source IP")

    args = parser.parse_args()

    send(IP(dst=args.ipDest, src=args.ipSrc)/TCP(dport=22, flags="R"))
    print("Done")


if __name__ == '__main__':
     main()




