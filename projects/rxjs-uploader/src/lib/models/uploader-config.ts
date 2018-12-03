import { FileUpload } from './file-upload';
import { IUploadRequestOptions } from './upload-request-options';

export type FileUploadCallbackReturn<ReturnType> = Promise<ReturnType> | ReturnType | void;

export interface IUploaderConfig<FileUploadType extends FileUpload = FileUpload> {
    allowedContentTypes?: string[];
    fileCountLimit?: number | (() => number);
    fileSizeLimitMb?: number;
    dragAndDropFlagSelector?: string;
    requestUrl?: string;
    requestOptions?: ((fileUpload?: FileUploadType) => Promise<IUploadRequestOptions>) | IUploadRequestOptions;
    fileUploadType?: any;
    allFilesQueuedCallback?: (fileUploads: FileUploadType[]) => FileUploadCallbackReturn<FileUploadType[]>;
    fileUploadedCallback?: (fileUpload: FileUploadType) => FileUploadCallbackReturn<FileUploadType>;
    allFilesUploadedCallback?: (fileUploads: FileUploadType[]) => FileUploadCallbackReturn<FileUploadType[]>;
    onFileCountLimitExceeded?: (fileCountLimit: number) => void;
}
