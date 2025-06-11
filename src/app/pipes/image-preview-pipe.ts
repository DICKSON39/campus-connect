// pipes/image-preview.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'imagePreview',
  standalone: true // so you can directly import into standalone components
})
export class ImagePreviewPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(file: File | null): SafeUrl | null {
    if (!file) return null;

    const reader = new FileReader();

    // This will temporarily store the result
    let dataUrl: SafeUrl | null = null;

    // We create a Promise to return the result when FileReader is done
    const promise = new Promise<SafeUrl | null>((resolve) => {
      reader.onload = () => {
        if (reader.result) {
          dataUrl = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
        }
        resolve(dataUrl);
      };
      reader.readAsDataURL(file);
    });

    // Angular doesn't wait for async pipes by default,
    // so this only works with [async] pipe or hacky temp solutions.
    // Instead: trigger the preview from the component for more control.
    return dataUrl;
  }
}
