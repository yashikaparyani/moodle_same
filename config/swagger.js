// config/swagger.js - Swagger/OpenAPI Configuration
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LMS Backend API Documentation',
      version: '2.0.0',
      description: 'Comprehensive API documentation for the Learning Management System (LMS) Backend. This API provides endpoints for authentication, user management, course management, organization management, and more.',
      contact: {
        name: 'API Support',
        email: 'support@lms.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'http://localhost:5000/api',
        description: 'Development API server'
      },
      {
        url: 'https://api.yourdomain.com',
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication, registration, and password management endpoints'
      },
      {
        name: 'Organizations',
        description: 'Organization management, registration, and token management'
      },
      {
        name: 'Users',
        description: 'User management and profile operations'
      },
      {
        name: 'Courses',
        description: 'Course management, creation, and enrollment tracking'
      },
      {
        name: 'Categories',
        description: 'Course category management and hierarchy'
      },
      {
        name: 'Audit',
        description: 'Audit logs and activity tracking'
      },
      {
        name: 'Cache',
        description: 'Cache management and invalidation'
      },
      {
        name: 'Enrollment',
        description: 'Course enrollment operations'
      },
      {
        name: 'Health',
        description: 'Server health check endpoints'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>'
        },
        OrganizationHeader: {
          type: 'apiKey',
          in: 'header',
          name: 'x-organization-id',
          description: 'Organization ID for multi-tenant operations'
        }
      },
      schemas: {
        // ========== Common Schemas ==========
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            error: {
              type: 'string',
              example: 'Detailed error description'
            }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Validation failed'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string'
                  },
                  message: {
                    type: 'string'
                  }
                }
              }
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation successful'
            }
          }
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              example: 100
            },
            page: {
              type: 'integer',
              example: 1
            },
            limit: {
              type: 'integer',
              example: 10
            },
            totalPages: {
              type: 'integer',
              example: 10
            }
          }
        },

        // ========== User Schema ==========
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            username: {
              type: 'string',
              example: 'john_doe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com'
            },
            firstName: {
              type: 'string',
              example: 'John'
            },
            lastName: {
              type: 'string',
              example: 'Doe'
            },
            role: {
              type: 'string',
              enum: ['student', 'teacher', 'admin', 'manager', 'course_creator'],
              example: 'student'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'suspended'],
              example: 'active'
            },
            isEmailVerified: {
              type: 'boolean',
              example: true
            },
            organization: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        UserRegistration: {
          type: 'object',
          required: ['username', 'email', 'password', 'firstName', 'lastName'],
          properties: {
            username: {
              type: 'string',
              example: 'john_doe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 6,
              example: 'SecurePass123!'
            },
            firstName: {
              type: 'string',
              example: 'John'
            },
            lastName: {
              type: 'string',
              example: 'Doe'
            },
            role: {
              type: 'string',
              enum: ['student', 'teacher'],
              default: 'student',
              example: 'student'
            }
          }
        },
        UserLogin: {
          type: 'object',
          required: ['identifier', 'password'],
          properties: {
            identifier: {
              type: 'string',
              description: 'Username or email',
              example: 'john_doe'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'SecurePass123!'
            }
          }
        },

        // ========== Organization Schema ==========
        Organization: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              example: 'Tech University'
            },
            subdomain: {
              type: 'string',
              example: 'techuni'
            },
            domain: {
              type: 'string',
              example: 'techuniversity.edu'
            },
            contactEmail: {
              type: 'string',
              format: 'email',
              example: 'admin@techuniversity.edu'
            },
            status: {
              type: 'string',
              enum: ['active', 'suspended', 'trial'],
              example: 'active'
            },
            settings: {
              type: 'object'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        // ========== Course Schema ==========
        Course: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            fullName: {
              type: 'string',
              example: 'Introduction to Web Development'
            },
            shortName: {
              type: 'string',
              example: 'WEB101'
            },
            description: {
              type: 'string',
              example: 'Learn the fundamentals of web development'
            },
            category: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            startDate: {
              type: 'string',
              format: 'date-time'
            },
            endDate: {
              type: 'string',
              format: 'date-time'
            },
            visible: {
              type: 'boolean',
              example: true
            },
            enrollmentKey: {
              type: 'string',
              example: 'WEB101-2024'
            },
            maxStudents: {
              type: 'integer',
              example: 50
            },
            organization: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            createdBy: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        // ========== Category Schema ==========
        Category: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              example: 'Programming'
            },
            description: {
              type: 'string',
              example: 'Programming and software development courses'
            },
            parent: {
              type: 'string',
              nullable: true,
              example: '507f1f77bcf86cd799439011'
            },
            path: {
              type: 'string',
              example: '/programming'
            },
            visible: {
              type: 'boolean',
              example: true
            },
            sortOrder: {
              type: 'integer',
              example: 1
            },
            organization: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        // ========== Audit Log Schema ==========
        AuditLog: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            action: {
              type: 'string',
              example: 'USER_LOGIN'
            },
            userId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            resourceType: {
              type: 'string',
              example: 'User'
            },
            resourceId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            changes: {
              type: 'object'
            },
            ipAddress: {
              type: 'string',
              example: '192.168.1.1'
            },
            userAgent: {
              type: 'string'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        // ========== Enrollment Schema ==========
        Enrollment: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            courseId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            enrollmentDate: {
              type: 'string',
              format: 'date-time'
            },
            status: {
              type: 'string',
              enum: ['active', 'completed', 'dropped'],
              example: 'active'
            }
          }
        }
      },
      parameters: {
        PageParam: {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          }
        },
        LimitParam: {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          }
        },
        SearchParam: {
          name: 'search',
          in: 'query',
          description: 'Search query string',
          schema: {
            type: 'string'
          }
        },
        SortParam: {
          name: 'sort',
          in: 'query',
          description: 'Sort field and order (e.g., createdAt:desc)',
          schema: {
            type: 'string'
          }
        },
        OrganizationIdParam: {
          name: 'x-organization-id',
          in: 'header',
          description: 'Organization ID for multi-tenant operations',
          required: false,
          schema: {
            type: 'string'
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Unauthorized',
                error: 'Authentication token is required'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'User does not have permission to access this resource',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Forbidden',
                error: 'You do not have permission to perform this action'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Not Found',
                error: 'The requested resource was not found'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationError'
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Internal Server Error',
                error: 'An unexpected error occurred'
              }
            }
          }
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/**/*.js',
    './models/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
