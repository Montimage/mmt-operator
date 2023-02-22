#!/usr/bin/env python
#This python script is to generate the traffic for testing all MMT rules
#Command: sudo python attacks_all.py [property id of the rule]
# Description:
#
# Execution:
#

from scapy.all import *
from struct import pack
from struct import unpack
from random import randint
import os, sys, socket, argparse
import urllib3
import binascii


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument("--ipDest",   help="Specify Target Host")
    parser.add_argument("--ipSrc",    help="Specify Source IP")
    parser.add_argument("--portDest", help="Specify Target Port")
    parser.add_argument("--portSrc",  help="Specify Source Port")

    args = parser.parse_args()

    p = IP(dst=args.ipDest, src=args.ipSrc)/TCP(sport=int(args.portSrc), dport=int(args.portDest), flags="S")/("A"*20)
    send( p )
    print("Done")


if __name__ == '__main__':
     main()




