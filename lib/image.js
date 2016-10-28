import _Asset from './asset'
import utils from './utils'
const Asset = _Asset({})

const imageViewTranslations = {
  weight: 'w',
  height: 'h',
  quality: 'q'
}

class _Image extends Asset {

  /**
   * Image Asset
   * @param {String} key    key
   * @param {Bucket} parent bucket object
   */
  constructor(key, parent, _config) {
    super()

    const config = utils.objExtend(utils.objClone(parent.config), {
      separate: '-'
    }, _config)

    this.key = key
    this.parent = parent
    this.config = config
  }

  /**
   * get the image's infomations
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  imageInfo(callback = noop) {
    const infoUrl = this.url() + '?imageInfo'

    return fetch(infoUrl)
      .then(res => res.json())
      .then(info => {
        callback(null, info)
        return info
      })
      .catch(err => {
        callback(err)
        return Promise.reject(err)
      })
  }

  /**
   * get the exif infomation of the picture
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  exif(callback = noop) {
    const infoUrl = this.url() + '?exif'

    return fetch(infoUrl)
      .then(res => res.json())
      .then(info => {
        callback(null, info)
        return info
      })
      .catch(err => {
        callback(err)
        return Promise.reject(err)
      })
  }

  /**
   * return a thumbnail image
   * @param  {Object}   opts     options
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  imageView(opts, callback = noop) {
    const mode = opts.mode
    delete opts.mode

    let url = this.url()
    const params = {}

    utils.each(opts, function(value, key) {
      if (imageViewTranslations.hasOwnProperty(key)) {
        key = imageViewTranslations[key]
      }

      params[key] = value
    })

    url += utils.format('?imageView/%d%s', mode, genOptUrl(params))
    return url
  }

  /**
   * return a processed image
   * @param  {Object}   opts     options
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  imageMogr(opts, callback = noop) {
    let url = this.url()
    const params = {}

    utils.objExtend(params, opts)
    
    url += utils.format('?imageMogr/v2/auto-orient%s', genOptUrl(params))

    return url
  }

  /**
   * return a image with a watermark
   * @param  {Object}   opts     options
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  watermark(opts, callback = noop) {
    let url = this.url()
    const params = {}
    const mode = opts.mode
    delete opts.mode

    utils.objExtend(params, opts)

    params.image = utils.safeEncode(params.image)

    url += utils.format('?watermark/%d%s', mode, genOptUrl(params))

    return url
  }
}

function genOptUrl(params) {
  var url = "";

  utils.each(params, function(value, key) {
    url += utils.format('/%s/%s', key, value);
  });

  return url;
}

function noop() {
  return false;
}

export default _Image