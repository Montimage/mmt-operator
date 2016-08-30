var _tools = {
  getNodeVersion : process.version,
  /**
   * Verify if the current version of nodejs is greater than the given one
   * @param  {string} v version tobe compared, eg 4.3.0
   * @return {number}   1 if
   */
  isNodeVersionGreaterThan : function( v ){
    var currentVersion = process.version;

  },
  daysInMonth : function (month,year) {
    const NOW = (new Date());
    year  = year || NOW.getFullYear();
    month = month || NOW.getMonth();
    return new Date(year, month, 0).getDate();
  }
}

module.exports = _tools;
