#Configuration file

## query_cache

Enable/disable database query results to files. 

A report needs data from DB. 

- enable: either `true` or `false` to enable or disable the usage of cache
- folder: directory containing cache files
- bytes: maximum total bytes of all cache files
- files: maximum number of cache files

When either `bytes` or `files` condition is violdated, the oldest cache files will be deleted until the both conditions are hold. The older file is the one has older accesse time. 