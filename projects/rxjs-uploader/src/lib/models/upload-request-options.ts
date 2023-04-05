import { HttpMethod } from './http-method';

export interface IUploadRequestOptions {
    url: string;
    method?: HttpMethod;
    formData?: FormData | { [key: string]: string };
    headers?: { [key: string]: string };
    withCredentials?: boolean;
}
