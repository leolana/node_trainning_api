interface FileStorage {
  upload(fileName, data): Promise<any>;

  download(path): Promise<any>;
}

export default FileStorage;
