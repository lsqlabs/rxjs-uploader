import { HttpMethod } from './http-method';

export interface IUploadRequestOptions {
    url: string;
    method?: HttpMethod;
    formData?: FormData;
    headers?: { [key: string]: string };
}
