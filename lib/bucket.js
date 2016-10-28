import _Asset from './asset'
import _Image from './image'
import File from './file'
import utils from './utils'
let Asset = null
import { DeviceEventEmitter } from 'react-native'
import NativeModules from 'NativeModules'
const RNUploader = NativeModules.RNUploader
import { isString, isObject, isFunction } from 'lodash'

let globalConfig = null

function noop() { return false }

class Bucket {
  /**
   * Bucket
   * Example:
   * ```
   * var imagesBucket = new qiniu.Bucket('images', {
   *   // special option
   * });
   * ```
   * @param {String} bucketName bucket's name
   * @param {Object} config     config
   */
  constructor(name, config = {}) {
    this.name = name
    this.queue = []
    this.config = utils.objExtend(globalConfig, config, {
      scope: name
    })

    if (this.config.url) {
      if (/\/$/.test(this.config.url)) {
        this.config.url = this.config.url.substr(0, this.config.url.length - 1);
      }
    } else {
      throw new ReferenceError('You should set the url of the bucket.')
    }
  }


  /**
   * Upload a file
   * Example:
   * ```
   * imagesBucket.putFile('example.jpg', __dirname + '/assert/example.jpg', function(err, reply) {
   *   if (err) {
   *     return console.error(err);
   *   }
   *  
   *   console.dir(reply);
   * });
   * ```
   * @param  {String}   key      key
   * @param  {File}     file     file
   * @param  {String}   putToken upload token
   * @param  {Function} callback Callback
   * @return {Promise}           Promise object
   */
  putFile(key, file, _putToken, callback = noop) {
    return new Promise((resolve, reject) => {
      if (!File.isFile(file)) return reject(new TypeError('Please upload a File Object'))

      let options = {}
      let putToken = null

      if (isObject(_putToken)) {
        options = _putToken
        putToken = options.putToken
      } else if (isString(_putToken)) {
        putToken = _putToken
      } else {
        return reject(new TypeError('The 3rd arguments should be a token string or a options object'))
      }

      // upload API
      const uploadUrl = 'https://' + globalConfig.uploadUrl

      const files = [
        { name: 'file', filename: file.filename, filetype: file.type, filepath: file.data }
      ]

      const opts = {
        url: uploadUrl,
        files,
        methods: 'POST',
        headers: { 'Accept': 'application/json' },
        params: {
          token: putToken,
          key
        }
      }

      // uploading
      RNUploader.upload(opts, (err, response) => {
        if (err) {
          callback(err)
          return reject(err)
        }

        const reply = JSON.parse(response.data)
        const asset = this.key(key)

        reply.asset = asset

        callback(null, reply)
        return resolve(reply)
      })
    })
    
  }

  /**
   * Get a key
   * @param  {String}   key      key
   * @param  {Function} callback Callback
   * @return {Promise}           Promise Object
   */
  getFile(key, callback = noop) {
    return new Promise((resolve, reject) => {
      // token
      const getToken = this.config.getToken || ''

      // key url
      let url = null
      if (this.config.url) {
        url = utils.format('%s/%s?e=3600&token=%s', this.url(), key, getToken)
      } else {
        url = utils.format('http://%s.qiniudn.com/%s?e=3600&token=%s', this.name, key, getToken)
      }

      RNFetchBlob
        .config({
          fileCache: true
        })
        .fetch('GET', url)
        .then(res => {
          callback(null, res.path())
          resolve(res.path())
        })
        .catch(err => {
          callback(err)
          reject(err)
        })
    })
  }

  url() {
    return this.config.url
  }

  /**
   * return a asset object
   * @param  {String} key key
   * @return {Asset}      asset object
   */
  key(key) {
    return new Asset(key, this)
  } 

  image(key) {
    return new _Image(key, this)
  }
}

Bucket.Image = _Image;

export default function(config) {
  globalConfig = config
  Asset = _Asset(config)
  return Bucket
}