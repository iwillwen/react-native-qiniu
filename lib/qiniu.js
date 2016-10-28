const _configData = {
  uploadUrl : 'up.qbox.me',
  rsUrl     : 'rs.qbox.me',
  rsfUrl    : 'rsf.qbox.me'
}

import _Asset from './asset'
const Asset = _Asset(_configData)
import _Bucket from './bucket'
const Bucket = _Bucket(_configData)
import _Image from './image'
import utils from './utils'
import File from './file'
import EventEmitter from 'EventEmitter'

const qiniu = {}

/**
 * Global Config
 * Example:
 * ```
 * qiniu.config({
 *   foo: '-----'
 * })
 *
 * qiniu.config('foo', 'bar')
 * qiniu.config('foo')
 * ``` 
 * @param  {String/Object} key   key of config
 * @param  {Mix}           value value
 */
qiniu.config = function(key, value) {
  if (arguments.length > 1 && key instanceof String) {
    // set config data normally
    qiniu.set(key, value)
  } else {
    switch (true) {
      case utils.isString(key):
        // Get config data
        return qiniu.get(key)
        break
      case utils.isObject(key):
        // Set config data with a object
        for (const ii in key) {
          (function(_key) {
            qiniu.set(_key, key[_key])
          })(ii)
        }
        break
    }
  }

  return this
}

/**
 * Set config data
 * @param  {String} key   key
 * @param  {Mix}    value value
 * @return {Object}       qiniu object
 */
qiniu.set = function(key, value) {
  _configData[key] = value

  return this
}

/**
 * Get config data
 * @param  {String} key   key
 * @return {Mix}          config value
 */
qiniu.get = function(key) {
  return _configData[key]
}

/**
 * Get a bucket
 * @param  {String} bucket Bucket name
 * @param  {Object} config Config object
 * @return {Bucket}        Bucket
 */
qiniu.bucket = function(bucket, config) {
  return new Bucket(bucket, config)
}

qiniu.Asset = Asset
qiniu.Bucket = Bucket
qiniu.Image = _Image
qiniu.File = File

utils.objExtend(qiniu, EventEmitter.prototype)

function noop() {
  return false
}

export default qiniu