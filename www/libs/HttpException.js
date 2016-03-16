function HttpException (request, response, message, code) {

  this.request  = request;
  this.response = response;  
  this.message  = message;    
  this.status   = code || 500;
};

module.exports = HttpException;