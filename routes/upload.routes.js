// routes/upload.routes.js - File Upload Routes
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { 
  uploadImage,
  uploadDocument,
  uploadVideo,
  uploadProfilePicture,
  uploadCourseMaterial,
  uploadAssignment,
  deleteFile,
  uploadDir
} = require('../middleware/fileUploadMiddleware');
const path = require('path');
const fs = require('fs');

/**
 * @swagger
 * tags:
 *   name: File Upload
 *   description: Secure file upload endpoints with malicious code protection
 */

/**
 * @swagger
 * /api/upload/profile-picture:
 *   post:
 *     summary: Upload profile picture
 *     tags: [File Upload]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: Invalid file type or size
 *       401:
 *         description: Unauthorized
 */
router.post('/profile-picture', authenticate, uploadProfilePicture, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: `/uploads/profile-pictures/${req.file.filename}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     summary: Upload image file
 *     tags: [File Upload]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 */
router.post('/image', authenticate, uploadImage, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: `/uploads/images/${req.file.filename}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/upload/document:
 *   post:
 *     summary: Upload document file
 *     tags: [File Upload]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Document uploaded successfully
 */
router.post('/document', authenticate, uploadDocument, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: `/uploads/documents/${req.file.filename}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/upload/video:
 *   post:
 *     summary: Upload video file
 *     tags: [File Upload]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Video uploaded successfully
 */
router.post('/video', authenticate, uploadVideo, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: `/uploads/videos/${req.file.filename}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading video',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/upload/course-material:
 *   post:
 *     summary: Upload course materials (multiple files)
 *     tags: [File Upload]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               courseMaterials:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Course materials uploaded successfully
 */
router.post('/course-material', authenticate, uploadCourseMaterial, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }
    
    const files = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: `/uploads/course-materials/${file.filename}`
    }));
    
    res.status(200).json({
      success: true,
      message: `${files.length} file(s) uploaded successfully`,
      files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading course materials',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/upload/assignment:
 *   post:
 *     summary: Upload assignment files (multiple documents)
 *     tags: [File Upload]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               assignmentFiles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Assignment files uploaded successfully
 */
router.post('/assignment', authenticate, uploadAssignment, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }
    
    const files = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: `/uploads/assignments/${file.filename}`
    }));
    
    res.status(200).json({
      success: true,
      message: `${files.length} file(s) uploaded successfully`,
      files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading assignment files',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/upload/delete:
 *   delete:
 *     summary: Delete uploaded file
 *     tags: [File Upload]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filename:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [images, documents, videos, profile-pictures, course-materials, assignments]
 *     responses:
 *       200:
 *         description: File deleted successfully
 */
router.delete('/delete', authenticate, (req, res) => {
  try {
    const { filename, category } = req.body;
    
    if (!filename || !category) {
      return res.status(400).json({
        success: false,
        message: 'Filename and category are required'
      });
    }
    
    const filePath = path.join(uploadDir, category, filename);
    
    const deleted = deleteFile(filePath);
    
    if (deleted) {
      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message
    });
  }
});

// Error handling middleware for multer errors
router.use((error, req, res, next) => {
  if (error) {
    console.error('File upload error:', error.message);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large',
        error: error.message
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files',
        error: error.message
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name',
        error: error.message
      });
    }
    
    return res.status(400).json({
      success: false,
      message: 'File upload error',
      error: error.message
    });
  }
  
  next();
});

module.exports = router;
