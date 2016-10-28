class File {
  constructor(filename = '', type='application/octet-stream', data) {
    this.filename = filename
    this.type = type
    this.data = data
  }

  static isFile(file) {
    return file instanceof File
  }
}

export default File