# React Native Qiniu SDK

纯JavaScript实现的Qiniu SDK,

## 安装

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

## 使用方法

```javascript
import qiniu from 'react-native-qiniu'

// 创建 Bucket 实例
const bucket = qiniu.bucket('<BUKCET_NAME>')

// 本地文件，从 CameraRoll 等地方取得 uri
const file = new qiniu.File('file.jpg', 'image/jpeg', '<LOCAL_URI>')

// 也可以通过 Base64 数据进行文件数据创建
// const file = new qiniu.File('file.png', 'image/png', '<BASE64_DATA>')

// 上传凭证需要通过安全渠道从服务器端获取
bucket.putFile('<KEY>', file, '<PUTTOKEN>')
  .then(reply => {
    const asset = reply.asset

    console.log(asset.url())  // 七牛云 CDN 资源 URL
  })
  .catch(err => console.error(err))
```

### Bucket

获得空间对象并进行操作。

```js
const imagesBucket = qiniu.bucket('qiniu-sdk-test')

// 也可以这样操作
// const imagesBucket = new qiniu.Bucket('qiniu-sdk-test')
```

#### 创建文件对象

在对文件数据进行上传之前，你需要先创建一个文件对象（类似于浏览器环境中的 `File` 对象）。

**从本地存储介质创建**

你可以通过 `CameraRoll` 等方式从设备的存储介质中取得文件地址，并利用其创建文件对象。

```js
import { CameraRoll } from 'react-native'
import path from 'path'
import mime from 'react-native-mimetype'

CameraRoll.getPhotos({
  first: 5,
  groupType: 'SavedPhotos',
  assetType: 'Photos'
})
  .then(({ assets }) => {
    const photoUri = assets[0].node.image.uri
    const filename = path.basename(photoUri)
    const filetype = mime.lookup(filename)

    // 创建文件对象
    const file = new qiniu.File(filename, filetype, photoUri)

    // ...
  })
```

**利用 Base64 数据创建**

除了从设备的存储介质中读取文件数据已上传外，我们还可以会遇到需要将由代码生成文件数据进行上传，这么便可以使用 Base64 对创建的文件数据进行编码，以便创建文件对象并上传到七牛云。

```js
const fileData = 'data:image/png;base64,.....'
const filename = 'foobar.png'
const filetype = 'image/png'

const file = new qiniu.File(filename, filetype, fileData)
```

#### 上传文件 `Bucket.putFile()`

上传一个文件，参数为将要上传的 Key、文件对象，第三个为参数 putToken，即本次上传中所使用 PutToken 的特殊设置，第四个为可选参数回调(callback)，若不传入回调函数，将由 putFile 函数所返回的 Promise 对象进行响应。

```js
// 上传
imagesBucket.putFile('exampleKey', file, putToken)
  .then(reply => {
    // 上传成功
    console.dir(reply)
  })
  .catch(err => {
    // 上传失败
    console.error(err)
  })
```

#### 取得资源 `Bucket.key()`

开发者可以通过 `Bucket.key()` 方法来取得某一个已经存储在七牛云对象存储空间内的文件资源对象（`Asset` 对象），以便进行下载和操作。

```js
const asset = imagesBucket.key('exampleKey')
```

### `Asset` 资源操作

七牛 React Native SDK 提供一个`Asset`类，用于对所属资源进行操作。

获取 key 所对应资源对象
```js
const picture = imagesBucket.key('exampleKey')
```

#### `Asset.url()`

`Asset.url()`方法可以获得该资源的 URL 地址以用于访问

```js
var picUrl = picture.url();
```

#### `Asset.entryUrl()`

`Asset.entryUrl()`方法可以获得该资源用于 API 调用时所需的 EncodedEntryURL。
但是在 React Native SDK 中，大部分 API 都不需要开发者自行使用。:)

```js
const encodedPicUrl = picture.entryUrl()
```

### `Image` 图片操作

七牛 Node.js SDK 提供`Image`类，用于对图片资源进行操作。

使用 Bucket.image() 方法获取一个图像对象

```js
const image = imagesBucket.image('exampleKey')
```

#### `Image.imageInfo()`

Image.imageInfo 方法可以用于获取图片资源的图片信息。
详细请看：[http://docs.qiniu.com/api/v6/image-process.html#imageInfo](http://docs.qiniu.com/api/v6/image-process.html#imageInfo)

```js
image.imageInfo(function(err, info) {
  if (err) {
    return console.error(err)
  }

  console.dir(info)
})
```

#### `Image.exif()`

Image.imageView 方法用于生成指定规格的缩略图。
详细请看：[http://docs.qiniu.com/api/v6/image-process.html#imageView](http://docs.qiniu.com/api/v6/image-process.html#imageView)

```js
image.exif(function(err, exif) {
  if (err) {
    return console.error(err)
  }

  console.dir(exif)
})
```

#### `Image.imageView()`

Image.imageView 方法用于生成指定规格的缩略图。
详细请看：[http://docs.qiniu.com/api/v6/image-process.html#imageView](http://docs.qiniu.com/api/v6/image-process.html#imageView)

```js
const url = image.imageView({
  mode    : 2,
  width   : 180,
  height  : 180,
  quality : 85,
  format  : 'jpg'
})
```

#### `Image.imageMogr()`

Image.imageMogr 方法用于调用高级图像处理接口，并返回处理后的图片数据。
详细请看：[http://docs.qiniu.com/api/v6/image-process.html#imageMogr](http://docs.qiniu.com/api/v6/image-process.html#imageMogr)

```js
const url = image.imageMogr({
  thumbnail : '300x500',
  gravity   : 'NorthWest',
  crop      : '!300x400a10a10',
  quality   : 85,
  rotate    : 90,
  format    : 'jpg'
})
```

#### `Image.watermark()`

Image.watermark 方法用于生成一个带有水印的图片，图片水印 API 支持图片水印和文字水印两种模式。
详细请看：http://docs.qiniu.com/api/v6/image-process.html#watermark

```js
const url = image.watermark({
  mode: 1,
  image: 'http://www.b1.qiniudn.com/images/logo-2.png',
  dissolve: 70,
  gravity: 'SouthEast',
  dx: 20,
  dy: 20
})
```

#### `Image.alias()`

Image.alias 方法用于返回既定的数据处理格式的数据，使用此方法需要在[七牛开发者平台](https://portal.qiniu.com)中对设置进行操作。
其中，`Image.alias()`方法继承于 key 所用的`Asset`类。

```js
const url = image.alias('testalias')
```


### `Fop` 管道操作

七牛云存储提供一个非常实用的资源处理 API，可以用于对资源进行多种处理的操作。

例: 将一个原图缩略，然后在缩略图上打上另外一个图片作为水印

使用`Asset.fop()`方法创建 Fop 管道操作器，并进行操作。

```js
var image = imagesBucket.key('exampleKey');
// Image.fop 方法继承于 Asset 类

const url = image.fop()
  // 对图片进行缩略
  .imageView({
    mode   : 2,
    height : 200
  })
  // 为图片打上水印
  .watermark({
    mode  : 1,
    image : 'http://www.b1.qiniudn.com/images/logo-2.png'
  })
  .url()
```