// middleware/fileUploadMiddleware.js - Secure File Upload Middleware
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Create subdirectories for different file types
const createUploadDirectories = () => {
  const dirs = [
    'documents',
    'images',
    'videos',
    'profile-pictures',
    'course-materials',
    'assignments',
    'temp'
  ];
  
  dirs.forEach(dir => {
    const dirPath = path.join(uploadDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};

createUploadDirectories();

/**
 * Allowed File Types Configuration
 * WHITELIST APPROACH - Only allow specific, safe file types
 */
const ALLOWED_FILE_TYPES = {
  images: {
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  documents: {
    extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf',
      'application/vnd.oasis.opendocument.text'
    ],
    maxSize: 10 * 1024 * 1024 // 10MB
  },
  videos: {
    extensions: ['mp4', 'webm', 'ogg'],
    mimeTypes: ['video/mp4', 'video/webm', 'video/ogg'],
    maxSize: 100 * 1024 * 1024 // 100MB
  },
  spreadsheets: {
    extensions: ['xls', 'xlsx', 'csv'],
    mimeTypes: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ],
    maxSize: 10 * 1024 * 1024 // 10MB
  },
  presentations: {
    extensions: ['ppt', 'pptx'],
    mimeTypes: [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ],
    maxSize: 20 * 1024 * 1024 // 20MB
  }
};

/**
 * Dangerous file extensions that should NEVER be allowed
 * Even if user tries to disguise them
 */
const DANGEROUS_EXTENSIONS = [
  'exe', 'bat', 'cmd', 'sh', 'bash',
  'js', 'jar', 'app', 'deb', 'rpm',
  'vbs', 'ps1', 'msi', 'dmg',
  'scr', 'com', 'pif', 'application',
  'gadget', 'msp', 'cpl', 'hta',
  'inf', 'ins', 'isp', 'job',
  'jse', 'lnk', 'msc', 'paf',
  'reg', 'rgs', 'sct', 'shb',
  'shs', 'u3p', 'vbe', 'vbscript',
  'ws', 'wsf', 'wsh', 'dll'
];

/**
 * Sanitize filename to prevent directory traversal and malicious names
 */
const sanitizeFilename = (filename) => {
  // Remove any path separators
  filename = path.basename(filename);
  
  // Remove non-alphanumeric characters except dots, dashes, underscores
  filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Remove multiple consecutive dots (potential directory traversal)
  filename = filename.replace(/\.{2,}/g, '.');
  
  // Ensure filename doesn't start with dot
  if (filename.startsWith('.')) {
    filename = filename.substring(1);
  }
  
  return filename;
};

/**
 * Generate secure random filename
 */
const generateSecureFilename = (originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(16).toString('hex');
  return `${timestamp}-${randomString}${ext}`;
};

/**
 * Check if file extension is dangerous
 */
const isDangerousFile = (filename) => {
  const ext = path.extname(filename).toLowerCase().replace('.', '');
  return DANGEROUS_EXTENSIONS.includes(ext);
};

/**
 * Validate file against allowed types
 */
const validateFileType = (file, allowedCategory) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const category = ALLOWED_FILE_TYPES[allowedCategory];
  
  if (!category) {
    throw new Error(`Invalid file category: ${allowedCategory}`);
  }
  
  // Check extension
  if (!category.extensions.includes(ext)) {
    throw new Error(`File extension .${ext} is not allowed. Allowed: ${category.extensions.join(', ')}`);
  }
  
  // Check MIME type
  if (!category.mimeTypes.includes(file.mimetype)) {
    throw new Error(`File type ${file.mimetype} is not allowed`);
  }
  
  // Check file size
  if (file.size > category.maxSize) {
    const maxSizeMB = (category.maxSize / (1024 * 1024)).toFixed(2);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(`File size ${fileSizeMB}MB exceeds maximum allowed size of ${maxSizeMB}MB`);
  }
  
  return true;
};

/**
 * Storage configuration with security features
 */
const createStorage = (destinationFolder = 'documents') => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = path.join(uploadDir, destinationFolder);
      
      // Ensure destination exists
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      try {
        // Sanitize original filename
        const sanitized = sanitizeFilename(file.originalname);
        
        // Check for dangerous files
        if (isDangerousFile(sanitized)) {
          return cb(new Error('Dangerous file type detected!'));
        }
        
        // Generate secure filename
        const secureFilename = generateSecureFilename(sanitized);
        
        // Store original name in file object for reference
        file.originalname = sanitized;
        
        cb(null, secureFilename);
      } catch (error) {
        cb(error);
      }
    }
  });
};

/**
 * File filter for security validation
 */
const createFileFilter = (allowedCategory) => {
  return (req, file, cb) => {
    try {
      // Check for null bytes (security vulnerability)
      if (file.originalname.includes('\0')) {
        return cb(new Error('Invalid filename: null byte detected'));
      }
      
      // Check if file is dangerous
      if (isDangerousFile(file.originalname)) {
        return cb(new Error('Dangerous file type not allowed'));
      }
      
      // Validate file type
      validateFileType(file, allowedCategory);
      
      cb(null, true);
    } catch (error) {
      cb(error);
    }
  };
};

/**
 * Create upload middleware for specific file types
 */
const createUploadMiddleware = (options = {}) => {
  const {
    category = 'documents',
    maxFiles = 1,
    fieldName = 'file'
  } = options;
  
  const categoryConfig = ALLOWED_FILE_TYPES[category];
  
  if (!categoryConfig) {
    throw new Error(`Invalid category: ${category}`);
  }
  
  const upload = multer({
    storage: createStorage(category),
    fileFilter: createFileFilter(category),
    limits: {
      fileSize: categoryConfig.maxSize,
      files: maxFiles
    }
  });
  
  // Return appropriate multer middleware based on maxFiles
  if (maxFiles === 1) {
    return upload.single(fieldName);
  } else {
    return upload.array(fieldName, maxFiles);
  }
};

/**
 * Pre-configured upload middlewares
 */
const uploadImage = createUploadMiddleware({
  category: 'images',
  maxFiles: 1,
  fieldName: 'image'
});

const uploadDocument = createUploadMiddleware({
  category: 'documents',
  maxFiles: 1,
  fieldName: 'document'
});

const uploadVideo = createUploadMiddleware({
  category: 'videos',
  maxFiles: 1,
  fieldName: 'video'
});

const uploadProfilePicture = multer({
  storage: createStorage('profile-pictures'),
  fileFilter: createFileFilter('images'),
  limits: {
    fileSize: ALLOWED_FILE_TYPES.images.maxSize,
    files: 1
  }
}).single('profilePicture');

const uploadCourseMaterial = multer({
  storage: createStorage('course-materials'),
  fileFilter: (req, file, cb) => {
    // Allow documents, images, videos for course materials
    const allowedMimes = [
      ...ALLOWED_FILE_TYPES.documents.mimeTypes,
      ...ALLOWED_FILE_TYPES.images.mimeTypes,
      ...ALLOWED_FILE_TYPES.videos.mimeTypes,
      ...ALLOWED_FILE_TYPES.presentations.mimeTypes
    ];
    
    if (isDangerousFile(file.originalname)) {
      return cb(new Error('Dangerous file type not allowed'));
    }
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed for course materials'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB for course materials
    files: 5
  }
}).array('courseMaterials', 5);

const uploadAssignment = multer({
  storage: createStorage('assignments'),
  fileFilter: createFileFilter('documents'),
  limits: {
    fileSize: ALLOWED_FILE_TYPES.documents.maxSize,
    files: 3
  }
}).array('assignmentFiles', 3);

/**
 * Clean up temporary files
 */
const cleanupTempFiles = () => {
  const tempDir = path.join(uploadDir, 'temp');
  
  if (fs.existsSync(tempDir)) {
    const files = fs.readdirSync(tempDir);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Deleted old temp file: ${file}`);
      }
    });
  }
};

// Run cleanup every 6 hours
setInterval(cleanupTempFiles, 6 * 60 * 60 * 1000);

/**
 * Delete file helper
 */
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Deleted file: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    return false;
  }
};

module.exports = {
  // Middleware
  uploadImage,
  uploadDocument,
  uploadVideo,
  uploadProfilePicture,
  uploadCourseMaterial,
  uploadAssignment,
  
  // Custom middleware creator
  createUploadMiddleware,
  
  // Utilities
  sanitizeFilename,
  generateSecureFilename,
  isDangerousFile,
  validateFileType,
  deleteFile,
  cleanupTempFiles,
  
  // Constants
  ALLOWED_FILE_TYPES,
  DANGEROUS_EXTENSIONS,
  uploadDir
};
