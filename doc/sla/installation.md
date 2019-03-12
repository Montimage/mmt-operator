#Requrements

Nodejs >= v8


#Execution

## Parameters

### `--config` 

Set to use another configuration file rather than the default one `config.json`

For example, to use `config-enodeb.json` file:

```bash
node bin/www --config=config-enodeb.json
```

### `-X`

Set to override a parameter in the configuration file. Can be used several times. 

`X` parameter is in format: `attribute=value` where:

- `attribute`
- `value` is a primitive value: number, string. It must not be an Object or Array.

For example, to override attribute `host` of `database_server` in the configuration file:


```bash
node bin/www --config=config-enodeb.json -Xdatabase_server.host=localhost
```

