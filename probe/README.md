# MMT Probe

Full instructions are available under ../README.md

We assume that dependencies are already installed

Compile the probe
  
    // Add these two destinations to your library path if it is not the case
    export LD_LIBRARY_PATH=/opt/mmt/lib:/usr/local/lib:$LD_LIBRARY_PATH

    // Compile the probe with:
    cd probe
    gcc -I/opt/mmt/include -o mmt-probe mmt-probe.c -L/opt/mmt/lib -lmmt_core -ldl -lpcap -ljson -lhiredis 

    // In case libstdc++6 error is encountered while compiling (related to libjson), use the following:
    gcc -I/opt/mmt/include -o mmt-probe mmt-probe.c -L/opt/mmt/lib -lmmt_core -ldl -lpcap -ljson -lhiredis -lstdc++

Copy TCPIP plugin to "plugins" folder

    // Add TCPIP plugin to the "plugins" folder, make either a copy or a symbollic link!
    mkdir plugins
    cp /opt/mmt/lib/libmmt_tcpip.so.0.99 plugins/libmmt_tcpip.so

Run the probe with

    // Check instruction using 
    // ./mmt-probe -h

    // Live interface
    sudo ./mmt-probe -i eth0 -p 15

    // Trace file (you need to provide a pre-recorded trace file) 
    ./mmt-probe -t FILE.pcap -p 5


