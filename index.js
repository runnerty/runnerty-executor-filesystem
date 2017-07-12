'use strict';

const fs = require('fs-extra');
const glob = require('glob');
const concat = require('concat-files');
const path = require('path');
const bytes = require('bytes');
const async = require('async'); // <--- TEMP hasta migrar async/await

var Execution = global.ExecutionClass;


class filesystemExecutor extends Execution {
  constructor(process) {
    super(process);
  }

  exec(params) {

    let _this = this;
    let operation = params.operation;
    let inputPath = params.path;
  
    /**
     * Avaliable operations
     * - ls
     * - mkdir
     */
    switch (operation) {
      case 'ls':
        _curatePath(inputPath, function(err, paths) {
          if (err) {
            _endError(err);
          } else {
            let resultFiles = [];
            
            async.each(paths, function (p, callback) {
              fs.stat(p, function (err, stats) {
                if (err) {
                  callback(err);
                } else {
                  if (stats.isFile()) {
                    resultFiles.push(p);
                    callback();
                  } else if (stats.isDirectory()) {
                    _ls(p, function (err, files) {
                      if (err) {
                        callback(err);
                      } else {
                        async.each(files, function(file, callback) {
                          let filePath = path.join(p, file);
                      
                          fs.stat(filePath, function(err, stats) {
                            console.log(stats);
                            if (err) {
                              callback(err);
                            } else {
                              resultFiles.push({
                                file: file,
                                path: filePath,
                                mtimeMs: stats.mtimeMs,
                                atimeMs: stats.atimeMs,
                                ctimeMs: stats.ctimeMs,
                                atime: stats.atime,
                                mtime: stats.mtime,
                                ctime: stats.ctime,
                                size: stats.size,
                                sizeH: bytes(stats.size)
                              });
                              callback();
                            }
                          });
                        }, function done(err) {
                          callback(err);
                        })
                    
                      }
                    })
                  } else {
                    // TODO symbolic links and so...?
                    callback();
                  }
                }
              })
          
            }, function done(err) {
              if (err) {
                _endError(err);
              } else {
                _endSuccess(resultFiles);
              }
            });
          }
        });
        break;
  
      case 'mkdir':
        let paths = [];
        let createdFolders = [];
        let notCreatedFolders = [];
    
        if (inputPath.constructor !== Array) {
          paths = [inputPath];
        } else {
          paths = inputPath;
        }
    
        async.each(paths, function(path, callback) {
          fs.mkdirs(path, function (err) {
            if (err) {
              notCreatedFolders.push(path);
              callback();
            } else {
              createdFolders.push(path);
              callback();
            }
          });
        }, function done(err) {
          if (err) {
            _endError(err);
          } else if(notCreatedFolders) {
            _endError(new Error(`Not created folders: ${notCreatedFolders}`));
          } else {
            _endSuccess(true);
          }
        });
        break;
      
      default:
        _endError(`Not method found for ${operation}`);
    }

    function _curatePath(path, callback) {
      let curatedPaths = [];

      let paths = [];

      if (path.constructor !== Array) {
        paths = [path];
      } else {
        paths = path;
      }

      async.each(paths, function (p, callback) {
        glob(p, null, function (err, list) {
          if (err) {
            callback(err);
          } else {
            let j = list.length;
            while (j--) {
              curatedPaths.push(list[j]);
            }
            callback();
          }
        });
      }, function done(err) {
        callback(err, curatedPaths);
      });
    }

    function _ls(path, callback) {
      if (path !== undefined) {
        fs.readdir(path, function (err, list) {
          callback(err, list);
        })
      } else {
        callback(new Error('Undefined path'));
      }
    }

    function _endError(err, messageLog) {
      let endOptions = {};
      endOptions.end = 'error';
      endOptions.messageLog = messageLog
        ? `Dir Error ${operation}: ${err}`
        : `Dir Error ${operation}: ${messageLog}`;
      endOptions.err_output = err;
      _this.end(endOptions);
    }

    function _endSuccess(res) {
      let endOptions = {};
      endOptions.data_output = res;
      _this.end(endOptions);
      console.log(res)
    }
  }
}

module.exports = filesystemExecutor;