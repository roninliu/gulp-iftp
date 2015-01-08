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

/**
 * host:服务器地址(必须)
 * port：服务器端口(必须)
 * user：ftp账户(必须)
 * pass：ftp账户密码(必须)
 * remote: 对应的服务器文件地址(必须)
 * logger：输出文件列表名称,默认在项目根目录生成文件(可选,默认：logger.txt)
 * froot: 提单文件前缀(可选，默认：/usr/local/imgcache/htdocs)
 * exp：体验环境地址(可选，默认null)
 * pro：正式环境地址(可选，默认null)
 */
module.exports = function (options) {
	options = assign({}, options);
	options.verbose = process.argv.indexOf('--verbose') !== -1;

	if (options.host === undefined) {
		throw new gutil.PluginError(gutil.colors.red("[Error]"),gutil.colors.cyan("Host is required"));
	}
	if (options.remote === undefined) {
		throw new gutil.PluginError(gutil.colors.red("[Error]"),gutil.colors.cyan("RemotePath is required"));
	}

	var remotePath = options.remote || '';
	delete options.remote;

	var remoteOrder = options.froot || "/usr/local/imgcache/htdocs";
	delete options.froot;

	var loggerFile = options.logger || "logger.txt";
	delete options.logger;

	var expUrl = options.exp || null;
	delete options.exp;

	var proUrl = options.pro || null;
	delete options.pro;


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
		    remoteRoot: remotePath,
		    exclude: ['.git',".svn"]
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
				    		fs.open(loggerFile,"w",function(e,fd){
				    			if(e){
				    				console.log(e);
				    			}else{
				    				fs.writeSync(fd,"[Gulp iFtp] 共计："+ order.length+"个文件上传成功 "+ new Date() +"\r\n");
				    				fs.writeSync(fd,"==========================================================================\r\n");
				    				fs.writeSync(fd,"\r\n");
				    				fs.writeSync(fd,"提单路径：\r\n");
				    				for(var i=0;i<order.length;i++){
							    		fs.writeSync(fd,order[i].toString() + "\r\n");
							    	}
							    	if(expUrl != null){
							    		fs.writeSync(fd,"\r\n");
							    		fs.writeSync(fd,"体验地址：\r\n");
					    				for(var i=0;i<order.length;i++){
								    		fs.writeSync(fd,order[i].toString().replace(remoteOrder,expUrl) + "\r\n");
								    	}
							    	}
							    	if(proUrl != null){
							    		fs.writeSync(fd,"\r\n");
							    		fs.writeSync(fd,"外网地址：\r\n");
					    				for(var i=0;i<order.length;i++){
								    		fs.writeSync(fd,order[i].toString().replace(remoteOrder,proUrl) + "\r\n");
								    	}
							    	}
				    			}
				    		})
				    	}
				    	gutil.log(gutil.colors.green("[INFO]"),gutil.colors.green("All upload has been completed!"))
						ftp.raw.quit();
						cb(null, null);
					}
				});
			}
		});
	})
};
