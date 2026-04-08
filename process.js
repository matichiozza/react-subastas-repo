const { Jimp } = require('jimp');

async function processImage() {
  try {
    const image = await Jimp.read('public/logo.png');
    
    // Autocrop the image to remove the white padding
    // For Jimp v1+, we might need different syntax, let's just make alpha transparent first
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      // If pixel is very close to white, make it transparent
      if (red > 240 && green > 240 && blue > 240) {
        this.bitmap.data[idx + 3] = 0; // Alpha channel to 0
      }
    });

    try { image.autocrop(); } catch (e) {} // ignore if autocrop is unsupported

    image.write('public/logo_transparent.png');
    console.log('Image processed successfully');
  } catch (err) {
    console.error(err);
  }
}

processImage();
