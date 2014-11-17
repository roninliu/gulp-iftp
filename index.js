'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var assign = require('object-assign');
var JSFtp = require('jsftp');
var chalk = require('chalk');
var fs = require("fs");
var FtpDeploy = require('ftp-deploy');
JSFtp = require('jsftp-mkdirp')(JSFtp);
var ftpDeploy = new FtpDeploy();


module.exports = function (options) {
	options = assign({}, options);
	options.verbose = process.argv.indexOf('--verbose') !== -1;

	if (options.host === undefined) {
		throw new gutil.PluginError(gutil.colors.red("[Error]"),gutil.colors.cyan("Host is required"));
	}
	if (options.remotePath === undefined) {
		throw new gutil.PluginError(gutil.colors.red("[Error]"),gutil.colors.cyan("RemotePath is required"));
	}

	var remotePath = options.remotePath || '';
	delete options.remotePath;

	var remoteOrder = options.remoteOrder || "/usr/local/imgcache/htdocs";
	delete options.remoteOrder;

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}
		if (file.isStream()) {
			cb(new gutil.PluginError(gutil.colors.red("[Error]"), gutil.colors.cyan("Streaming not supported")));
			return;
		}
		var _that = this;
		var filePath = file.path.slice(0,file.path.lastIndexOf("\\"));
		var config = {
		    username:options.user,
		    password: options.pass,
		    host: options.host,
		    port: options.port,
		    localRoot: filePath,
		    remoteRoot: remotePath
		}
		var ftp = new JSFtp(options);
		var files = [];
		ftp.mkdirp(remotePath, function (err) {
			if (err) {
				cb(new gutil.PluginError(gutil.colors.red("[Error]"), err));
				return;
			}else{
				ftpDeploy.on('uploaded', function (data){
					var uploadFile = data.filename.replace(/\\/g,"/");
					if(uploadFile.indexOf("/") == 0){
						uploadFile = uploadFile.replace("/","");
					}
					gutil.log(gutil.colors.green("[SUCCESS]:"),gutil.colors.yellow(uploadFile),gutil.colors.yellow("Uploaded"))
				    files.push(uploadFile);
				});
				ftpDeploy.deploy(config, function(err) {
				    if (err){
				    	cb(new gutil.PluginError(gutil.colors.red("[Error]"), err));
				    }else{
				    	var order = [];
				    	for(var i=0;i<files.length;i++){
				    		order.push(remoteOrder+ remotePath + "/"+ files[i]);
				    		gutil.log(gutil.colors.cyan(remoteOrder + remotePath + "/" + files[i]));
				    	}
				    	if(order.length !== 0){
				    		fs.open("test.txt","w",function(e,fd){
				    			if(e){
				    				console.log(e);
				    			}else{
				    				for(var i=0;i<order.length;i++){
							    		fs.writeSync(fd,order[i].toString() + "\r\n");
							    	}
				    			}
				    		})
				    	}
				    	gutil.log(gutil.colors.green("[INFO]"),gutil.colors.green("All upload has been completed!"))
						ftp.raw.quit();
						cb(null, file);
					}
				});
			}
		});
	})
};
