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

  /**
   * Delete HTML file from Cloudinary
   * @param {string} secureUrl 
   * @returns {Promise<void>}
   */
  static deleteHTMLFromCloudinary(secureUrl) {
    return new Promise((resolve, reject) => {
      try {
        // Example URL: https://res.cloudinary.com/cloud/raw/upload/v12345/websites/html_123_file.html
        // We need the part after /upload/v.../
        const urlParts = secureUrl.split('/upload/');
        if (urlParts.length !== 2) {
          return resolve(); // Not a standard cloudinary url, skip deletion
        }
        
        // Remove version number if present (e.g. v12345/)
        let publicIdPath = urlParts[1];
        if (publicIdPath.match(/^v\d+\//)) {
          publicIdPath = publicIdPath.substring(publicIdPath.indexOf('/') + 1);
        }
        
        cloudinary.uploader.destroy(publicIdPath, { resource_type: 'raw' }, (error, result) => {
          if (error) {
            console.error('Cloudinary deletion error:', error);
            // We resolve anyway so it doesn't break the local DB deletion
            resolve();
          } else {
            resolve();
          }
        });
      } catch (error) {
        console.error('Error parsing Cloudinary URL:', error);
        resolve();
      }
    });
  }
}

module.exports = WebsiteService;
