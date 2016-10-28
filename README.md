# React Native Qiniu SDK

纯JavaScript实现的Qiniu SDK,

##安装

```shell
npm i react-native-qiniu  --save
```

若你使用的 React Native 版本大于等于 `0.29`，则在完成安装后运行以下命令：

```shell
$ react-native link
```

若 React Native 版本小于 `0.29`，则运行以下命令：

```shell
$ rnpm link
```

##使用方法

```javascript
import qiniu from 'react-native-qiniu'

// 创建 Bucket 实例
const bucket = qiniu.bucket('<BUKCET_NAME>')

// 本地文件，从 CameraRoll 等地方取得 uri
const file = new qiniu.File('file.jpg', 'image/jpeg', '<LOCAL_URI>')

// 也可以通过 Base64 数据进行文件数据创建
// const file = new qiniu.File('file.png', 'image/png', '<BASE64_DATA>')

// 上传凭证需要通过安全渠道从服务器端获取
bucket.putFile('<KEY>', file, <PUTTOKEN>)
  .then(reply => {
    const asset = reply.asset

    console.log(asset.url())  // 七牛云 CDN 资源 URL
  })
  .catch(err => console.error(err))
```

##进行中

[RoadMap](https://github.com/qiniu/react-native-sdk/issues/1)