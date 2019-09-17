export function setAcceptAttribute(fileInputElement: HTMLInputElement, accept: string): void {
    // For iOS, the accept attribute is broken, not allowing some filetypes when they should be allowed.
    // Solution is to not set the accept attribute if user is on an iOS device.
    // https://github.com/lionheart/openradar-mirror/issues/19227
    if (!!navigator.platform && !(/iPad|iPhone|iPod/.test(navigator.platform))) {
        fileInputElement.setAttribute('accept', accept);
    }
}
