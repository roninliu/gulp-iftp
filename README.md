GULP IFTP
=========

###  简介
gulp-iftp是基于jsftp， ftp-deploy自动部署项目到ftp服务器上的gulp插件
并输出对应的服务器文件列表，文件url地址（可配）

### 安装方法
```
npm install gulp-iftp
```

### gulp配置
```
var ftp = requrie("gulp-iftp");

gulp.task("publish",function(){
	return gulp.src("./dist/*")
		.pipe(ftp{
			host:"your host",
			port:"your port",
			user:"user",
			pass:"password",
			remotePath:"/remotepath/dist",
			remoteOrder:"/usr/local/"
		})
})
```



