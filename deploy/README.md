## MMT Operator Service Script

Dependency

    sudo npm install -g forever

Copy the shell script into 

    sudo cp mmtoperator /etc/init.d

Initialize the Service 

    sudo update-rc.d mmtoperator defaults

Remove the service

    sudo update-rc.d -f mmtoperator remove

Then we can use

    sudo service mmtoperator start/stop

