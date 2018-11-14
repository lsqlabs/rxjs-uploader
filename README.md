# Rxjs Uploader

A simple RxJs-powered interface for uploading files.

## Basic example

```html
<input id="file-input" type="file">
```

```javascript
const fileUploads$ = new Uploader()
    .setRequestUrl('https://www.mocky.io/v2/5185415ba171ea3a00704eed')
    .streamFileUploads(fileInput);
```

