GULP IFTP
=========

###  简介
gulp-iftp是自动部署项目到ftp服务器上的gulp插件,并输出对应的服务器文件列表，文件url地址,提单文件列表

### 安装方法
```
npm install gulp-iftp
```

### gulp配置
```
var ftp = requrie("gulp-iftp");

gulp.task("publish",function(){
	return gulp.src("./dist/index.html")
        .pipe(ftp({
          host:"your host address",
          port:"your host port",
          user:"your ftp account",
          pass:"your ftp passwrod",
          logger:"output list file,ex:files.txt",
          froot:"server file list prefix,ex:/usr/local/htdocs",
          remote:"remote file path, ex:/yourwebroot/webname",
          exp:"for experience url,ex:http://www.xxx.com",
          pro:"for production url, ex:http://www.xxx.com"
        }))
})
```
说明：gulp.src("./dist/index.html"),必须给一个启动插件的文件，如果没有插件将不执行任何动作，只需要给一个已经存在的文件名，不能使用“*”代替，使用“*”将导致文件多次上传，以及重复输出logger
### 参数
```
host:服务器地址(必须)
port：服务器端口(必须)
user：ftp账户(必须)
pass：ftp账户密码(必须)
remote: 对应的服务器文件地址(必须)
logger：输出文件列表名称,默认在项目根目录生成文件(可选,默认：logger.txt)
froot: 提单文件前缀(可选，默认：/usr/local/imgcache/htdocs)
exp：体验环境地址(可选，默认null)
pro：正式环境地址(可选，默认null)

```

### 使用
```
gulp publish
```

