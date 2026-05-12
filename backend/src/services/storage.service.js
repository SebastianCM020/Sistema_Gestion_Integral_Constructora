const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * StorageService: Maneja el almacenamiento de archivos (Local por ahora, extensible a S3/Azure)
 */
class StorageService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
    this.ensureDirectoryExists();
  }

  ensureDirectoryExists() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    
    // Subcarpetas por tipo
    const subdirs = ['evidencias', 'documentos'];
    subdirs.forEach(dir => {
      const p = path.join(this.uploadDir, dir);
      if (!fs.existsSync(p)) {
        fs.mkdirSync(p, { recursive: true });
      }
    });
  }

  /**
   * Guarda un archivo en el sistema de archivos local
   * @param {Buffer} buffer - Contenido del archivo
   * @param {string} originalName - Nombre original para extraer extensión
   * @param {string} folder - Carpeta destino (evidencias, documentos)
   * @returns {Object} - Info del archivo guardado
   */
  async uploadFile(buffer, originalName, folder = 'evidencias') {
    const ext = path.extname(originalName).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    const relativePath = path.join(folder, filename);
    const fullPath = path.join(this.uploadDir, relativePath);

    fs.writeFileSync(fullPath, buffer);

    return {
      filename,
      storageKey: relativePath,
      url: `/uploads/${relativePath.replace(/\\/g, '/')}`, // URL pública simulada
      size: buffer.length,
    };
  }

  /**
   * Valida si el archivo es una imagen permitida y tiene un tamaño válido
   */
  validateImage(mimeType, sizeBytes) {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

    if (!allowedMimeTypes.includes(mimeType)) {
      throw new Error('Formato de imagen no válido. Solo se permite JPG y PNG.');
    }

    if (sizeBytes > MAX_SIZE) {
      throw new Error('El archivo excede el tamaño máximo permitido de 5 MB.');
    }

    return true;
  }
}

module.exports = new StorageService();
