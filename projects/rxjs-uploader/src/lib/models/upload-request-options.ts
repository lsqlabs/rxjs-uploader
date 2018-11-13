import { HttpMethod } from './http-method';

export interface IUploadRequestOptions {
    url: string;
    method?: HttpMethod;
    formData?: FormData;
}

export interface IUploadRequestOptionsPatch {
    url?: string;
    method?: HttpMethod;
    formData?: FormData;
}
