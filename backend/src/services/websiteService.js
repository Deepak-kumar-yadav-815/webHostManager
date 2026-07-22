const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

class WebsiteService {
  /**
   * Upload HTML file to Cloudinary
   * @param {Buffer} fileBuffer 
   * @param {string} originalName 
   * @returns {Promise<string>} cloudinary secure URL
   */
  static uploadHTMLToCloudinary(fileBuffer, originalName) {
    return new Promise((resolve, reject) => {
      const cld_upload_stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          format: 'html',
          public_id: `websites/html_${Date.now()}_${originalName}`
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      );

      streamifier.createReadStream(fileBuffer).pipe(cld_upload_stream);
    });
  }
}

module.exports = WebsiteService;
