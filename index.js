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
    let insensitiveCase = params.insensitiveCase;
  
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
                    resultFiles.push({
                      file: p.split(path.sep).pop(),
                      path: p,
                      mtimeMs: stats.mtimeMs,
                      atimeMs: stats.atimeMs,
                      ctimeMs: stats.ctimeMs,
                      atime: stats.atime,
                      mtime: stats.mtime,
                      ctime: stats.ctime,
                      size: stats.size,
                      sizeH: bytes(stats.size),
                      isFile: 1,
                      isDirectory: 0,
                      exists: 1
                    });
                    callback();
                  } else if (stats.isDirectory()) {
                    _ls(p, function (err, files) {
                      if (err) {
                        callback(err);
                      } else {
                        async.each(files, function(file, callback) {
                          let filePath = path.join(p, file);
                      
                          fs.stat(filePath, function(err, stats) {
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
                                sizeH: bytes(stats.size),
                                isFile: 0,
                                isDirectory: 1,
                                exists: 1
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
  
      case 'stat':
        let pathsStats = [];
    
        if (inputPath.constructor !== Array) {
          inputPath = [inputPath];
        }
    
        async.each(inputPath, function(p, callback) {
          fs.stat(p, function(err, stats) {
            if (!err) {
              pathsStats.push({
                file: p.split(path.sep).pop(),
                path: p,
                mtimeMs: stats.mtimeMs,
                atimeMs: stats.atimeMs,
                ctimeMs: stats.ctimeMs,
                atime: stats.atime,
                mtime: stats.mtime,
                ctime: stats.ctime,
                size: stats.size,
                sizeH: bytes(stats.size),
                isFile: stats.isFile() ? 1 : 0,
                isDirectory: stats.isDirectory() ? 1 : 0,
                exists: 1
              });
            } else {
              pathsStats.push({
                path: p,
                exists: 0
              })
            }
            callback();
          })
        }, function(err) {
          if (err) {
            _endError(err);
          } else {
            _endSuccess(pathsStats);
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
        glob(p, {nocase: insensitiveCase}, function (err, list) {
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
      endOptions.extra_output = {};
      endOptions.data_output = res;
      if (res.length){
        endOptions.extra_output.first_match_exists  = res[0].exists;
        endOptions.extra_output.first_match_file  = res[0].file;
        endOptions.extra_output.first_match_path  = res[0].path;
        endOptions.extra_output.first_match_mtimeMs  = res[0].mtimeMs;
        endOptions.extra_output.first_match_atimeMs  = res[0].atimeMs;
        endOptions.extra_output.first_match_ctimeMs  = res[0].ctimeMs;
        endOptions.extra_output.first_match_atime  = res[0].atime;
        endOptions.extra_output.first_match_mtime  = res[0].mtime;
        endOptions.extra_output.first_match_ctime  = res[0].ctime;
        endOptions.extra_output.first_match_size  = res[0].size;
        endOptions.extra_output.first_match_sizeH  = res[0].sizeH;
      }
      _this.end(endOptions);
    }
  }
}

module.exports = filesystemExecutor;