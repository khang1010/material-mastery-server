const swaggerObj = {
  openapi: '3.0.0',
  info: {
    title: 'Material Mastery API',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'http://localhost:8083/v1/api',
    },
  ],
  paths: {
    '/user/signUp': {
      post: {
        summary: 'Sign up a new user',
        tags: ['User'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: {
                    type: 'string',
                  },
                  password: {
                    type: 'string',
                  },
                  email: {
                    type: 'string',
                  },
                  display_name: {
                    type: 'string',
                  },
                  phone: {
                    type: 'string',
                  },
                  user_attributes: {
                    type: 'object',
                    // Add more properties specific to user attributes
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Sign up successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                    statusCode: {
                      type: 'integer',
                      default: 200,
                    },
                    reasonStatusCode: {
                      type: 'string',
                    },
                    metadata: {
                      type: 'object',
                      properties: {
                        shop: {
                          type: 'object',
                          properties: {
                            username: {
                              type: 'string',
                            },
                            password: {
                              type: 'string',
                            },
                            email: {
                              type: 'string',
                            },
                            display_name: {
                              type: 'string',
                            },
                            phone: {
                              type: 'string',
                            },
                            status: {
                              type: 'string',
                            },
                            isBlocked: {
                              type: 'boolean',
                            },
                            roles: {
                              type: 'array',
                              items: {
                                type: 'string',
                              },
                            },
                            user_attributes: {
                              type: 'object',
                              description: 'flexible for each role of user',
                              // Add more properties specific to user attributes
                            },
                            _id: {
                              type: 'string',
                            },
                            createdAt: {
                              type: 'string',
                            },
                            updatedAt: {
                              type: 'string',
                            },
                            __v: {
                              type: 'integer',
                            },
                          },
                        },
                        tokenPair: {
                          type: 'object',
                          properties: {
                            accessToken: {
                              type: 'string',
                            },
                            refreshToken: {
                              type: 'string',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '409': {
            description: 'User already exists',
          },
        },
        parameters: [
          {
            name: 'x-api-key',
            in: 'header',
            description: 'API-Key',
            required: true,
            schema: {
              type: 'string',
            },
          },
          
        ],
      },
    },
    '/user/signIp': {
      post: {
        summary: 'Sign in',
        tags: ['User'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  userInfo: {
                    type: 'string',
                  },
                  password: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Sign in successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                    statusCode: {
                      type: 'integer',
                      default: 200,
                    },
                    reasonStatusCode: {
                      type: 'string',
                    },
                    metadata: {
                      type: 'object',
                      properties: {
                        shop: {
                          type: 'object',
                          properties: {
                            username: {
                              type: 'string',
                            },
                            password: {
                              type: 'string',
                            },
                            email: {
                              type: 'string',
                            },
                            display_name: {
                              type: 'string',
                            },
                            phone: {
                              type: 'string',
                            },
                            status: {
                              type: 'string',
                            },
                            isBlocked: {
                              type: 'boolean',
                            },
                            roles: {
                              type: 'array',
                              items: {
                                type: 'string',
                              },
                            },
                            user_attributes: {
                              type: 'object',
                              'x-comment': 'Add more properties specific to user attributes',
                            },
                            _id: {
                              type: 'string',
                            },
                            createdAt: {
                              type: 'string',
                            },
                            updatedAt: {
                              type: 'string',
                            },
                            __v: {
                              type: 'integer',
                            },
                          },
                        },
                        tokenPair: {
                          type: 'object',
                          properties: {
                            accessToken: {
                              type: 'string',
                            },
                            refreshToken: {
                              type: 'string',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'User not found or Wrong password',
          },
        },
        parameters: [
          {
            name: 'x-api-key',
            in: 'header',
            description: 'API-Key',
            required: true,
            schema: {
              type: 'string',
            },
          },
          
        ],
      },
    },
  },
};

module.exports = swaggerObj;