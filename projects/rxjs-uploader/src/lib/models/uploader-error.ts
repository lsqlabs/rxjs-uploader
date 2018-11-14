export class UploaderError extends Error { }
export class FileUploadError extends UploaderError { }
export class DisallowedContentTypeError extends FileUploadError { }
export class FileSizeLimitExceededError extends FileUploadError { }
export class MissingRequestOptionsError extends FileUploadError { }
