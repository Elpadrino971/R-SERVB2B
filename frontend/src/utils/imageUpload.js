/**
 * Image Upload Utility
 * Supporte plusieurs providers : CloudFlare R2, AWS S3, Supabase, Backend direct
 */

import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/**
 * Configuration du provider d'upload
 * Modifier selon votre choix : 'backend' | 'cloudflare' | 'aws' | 'supabase'
 */
const UPLOAD_PROVIDER = process.env.REACT_APP_UPLOAD_PROVIDER || 'backend';

/**
 * Upload une image vers le backend
 * @param {File} file - Fichier image
 * @param {string} folder - Dossier de destination (ex: 'vehicles', 'agencies')
 * @returns {Promise<{url: string, name: string}>}
 */
export const uploadImage = async (file, folder = 'vehicles') => {
  // Validation
  if (!file) {
    throw new Error('Aucun fichier fourni');
  }

  const maxSize = 5 * 1024 * 1024; // 5 MB
  if (file.size > maxSize) {
    throw new Error('Le fichier est trop volumineux (max 5 MB)');
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Type de fichier non autorisé (JPEG, PNG, WEBP, GIF uniquement)');
  }

  // Upload selon le provider
  switch (UPLOAD_PROVIDER) {
    case 'backend':
      return uploadToBackend(file, folder);

    case 'cloudflare':
      return uploadToCloudFlareR2(file, folder);

    case 'aws':
      return uploadToAWSS3(file, folder);

    case 'supabase':
      return uploadToSupabase(file, folder);

    default:
      return uploadToBackend(file, folder);
  }
};

/**
 * Upload multiple images
 * @param {FileList|Array<File>} files
 * @param {string} folder
 * @returns {Promise<Array<{url: string, name: string}>>}
 */
export const uploadMultipleImages = async (files, folder = 'vehicles') => {
  const fileArray = Array.from(files);
  const uploadPromises = fileArray.map(file => uploadImage(file, folder));
  return Promise.all(uploadPromises);
};

/**
 * Upload vers le backend (méthode par défaut)
 */
const uploadToBackend = async (file, folder) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  try {
    const response = await axios.post(`${API}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      url: response.data.url,
      name: file.name,
      size: file.size,
      provider: 'backend'
    };
  } catch (error) {
    console.error('Error uploading to backend:', error);
    throw new Error('Erreur lors de l\'upload au backend');
  }
};

/**
 * Upload vers CloudFlare R2 (via backend signedURL)
 */
const uploadToCloudFlareR2 = async (file, folder) => {
  try {
    // 1. Obtenir une URL signée du backend
    const signedUrlResponse = await axios.post(`${API}/upload/signed-url`, {
      filename: file.name,
      folder: folder,
      contentType: file.type
    });

    const { signedUrl, publicUrl } = signedUrlResponse.data;

    // 2. Upload direct vers CloudFlare R2
    await axios.put(signedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });

    return {
      url: publicUrl,
      name: file.name,
      size: file.size,
      provider: 'cloudflare'
    };
  } catch (error) {
    console.error('Error uploading to CloudFlare R2:', error);
    throw new Error('Erreur lors de l\'upload vers CloudFlare R2');
  }
};

/**
 * Upload vers AWS S3 (via backend signedURL)
 */
const uploadToAWSS3 = async (file, folder) => {
  try {
    // 1. Obtenir une URL signée du backend
    const signedUrlResponse = await axios.post(`${API}/upload/s3-signed-url`, {
      filename: file.name,
      folder: folder,
      contentType: file.type
    });

    const { signedUrl, publicUrl } = signedUrlResponse.data;

    // 2. Upload direct vers S3
    await axios.put(signedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });

    return {
      url: publicUrl,
      name: file.name,
      size: file.size,
      provider: 'aws-s3'
    };
  } catch (error) {
    console.error('Error uploading to AWS S3:', error);
    throw new Error('Erreur lors de l\'upload vers AWS S3');
  }
};

/**
 * Upload vers Supabase Storage
 */
const uploadToSupabase = async (file, folder) => {
  try {
    // Note: Nécessite @supabase/supabase-js installé
    // import { createClient } from '@supabase/supabase-js'
    // const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    const response = await axios.post(`${API}/upload/supabase`, {
      filename: file.name,
      folder: folder,
    });

    const { uploadUrl, publicUrl } = response.data;

    // Upload vers Supabase
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });

    return {
      url: publicUrl,
      name: file.name,
      size: file.size,
      provider: 'supabase'
    };
  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    throw new Error('Erreur lors de l\'upload vers Supabase');
  }
};

/**
 * Supprimer une image
 * @param {string} imageUrl - URL de l'image à supprimer
 */
export const deleteImage = async (imageUrl) => {
  try {
    await axios.delete(`${API}/upload`, {
      data: { url: imageUrl }
    });
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Erreur lors de la suppression de l\'image');
  }
};

/**
 * Compresser une image avant upload (optionnel)
 * @param {File} file
 * @param {number} maxWidth
 * @param {number} quality
 * @returns {Promise<File>}
 */
export const compressImage = async (file, maxWidth = 1920, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};
