export class UploaderError extends Error { }
export class FileUploadError extends UploaderError { }
export class DisallowedContentTypeError extends FileUploadError { }
export class MissingRequestOptionsError extends FileUploadError { }
