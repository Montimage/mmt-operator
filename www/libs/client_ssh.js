const Client = require('ssh2').Client;

class SSHClient {
  constructor() {
    this.connection = new Client();
  }

  connect(options) {
    return new Promise((resolve, reject) => {
      this.connection.on('ready', () => {
        console.log('SSH connection established');
        resolve();
      });

      this.connection.on('error', (err) => {
        console.error('SSH connection error:', err);
        reject(err);
      });

      this.connection.connect(options);
    });
  }

  executeCommand(command) {
    return new Promise((resolve, reject) => {
      this.connection.exec(command, (err, stream) => {
        if (err) {
          console.error('Error executing command:', err);
          reject(true); // Command execution was not successful
          return;
        }

        stream
          .on('data', (data) => {
            console.log(`STDOUT: ${data}`);
          })
          .on('end', () => {
            resolve(true); // Command execution was successful
          })
          .stderr.on('data', (data) => {
            console.error('Command error:', data.toString());
            reject(true); // Command execution was not successful
          });
      });
    });
  }

  disconnect() {
    this.connection.end();
    console.log('SSH connection closed');
  }
}
module.exports = SSHClient
