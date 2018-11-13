import { Type } from '@angular/core';
import { FileUpload } from './file-upload';
import { IUploadRequestOptions } from './upload-request-options';

export interface IUploaderConfig<FileUploadType extends FileUpload = FileUpload> {
    allowedContentTypes?: string[];
    fileCountLimit?: number | (() => number);
    fileSizeLimitMb?: number;
    dragAndDropFlagSelector?: string;
    requestUrl?: string;
    requestOptions?: ((fileUpload?: FileUploadType) => Promise<IUploadRequestOptions>) | IUploadRequestOptions;
    fileUploadType?: Type<FileUploadType>;
    allFilesQueuedCallback?: (fileUploads: FileUploadType[]) => Promise<FileUploadType[]>;
    fileUploadedCallback?: (fileUpload: FileUploadType) => Promise<FileUploadType>;
    allFilesUploadedCallback?: (fileUploads: FileUploadType[]) => Promise<FileUploadType[]>;
    onFileCountLimitExceeded?: (fileCountLimit: number) => void;
}
