#This python script is to generate the traffic for testing all MMT rules 
#Command: sudo python attacks_all.py [property id of the rule]
from scapy.all import *
from struct import pack
from struct import unpack
from random import randint
import os
import sys
import urllib3
import binascii
import socket


def main(): 
    parser = argparse.ArgumentParser()

    parser.add_argument("host", help="Specify Target Host")
    parser.add_argument("user", help="Specify Target User")
    parser.add_argument("file", help="Specify Password File")
    
    args = parser.parse_args()


if __name__ == '__main__':
     main()




