# Filesystem executor for [Runnerty]:

### Configuration sample:
```json
{
  "id":"fs_default",
  "type":"@runnerty-executor-filesystem"
}
```

### Plan sample:
```json
{
 "id":"fs_default",
 "path": "/etc/runnerty/*.log",
 "operation": "stat"
}
```

```json
{
 "id":"fs_default",
 "path": ["/etc/runnerty/*.log","/etc/runnerty/*.zip"],
 "operation": "ls",
 "options":{
   "orderBy": {"attribute":["size","file"],
               "order":"desc"}
 }
}
```

### Operation
* stat: 
* ls: 
* mkdir: 

### Output (Process values):
#### Standard
* `PROCESS_EXEC_MSG_OUTPUT`: Array files/directories stats. 
* `PROCESS_EXEC_ERR_OUTPUT`: Error output message.
#### stat output
#### ls output
#### mkdir output

[Runnerty]: http://www.runnerty.io