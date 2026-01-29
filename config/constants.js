// ==============================================
// APPLICATION CONSTANTS
// ==============================================

const DEFAULT_PORT = 5000;
const DEFAULT_MONGODB_URI = 'mongodb://127.0.0.1:27017/lotus_video';
const MONGODB_CONNECTED_STATE = 1;
const ENVIRONMENT_DEVELOPMENT = 'development';

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

const API_ENDPOINTS = {
  AUTH: {
    REGISTER: 'POST /api/auth/register',
    LOGIN: 'POST /api/auth/login',
    ME: 'GET  /api/auth/me',
    UPDATE: 'PUT  /api/auth/update',
    UPLOAD_AVATAR: 'POST /api/auth/upload-avatar',
  },
  VIDEOS: {
    LIST: 'GET  /api/videos',
    GET_BY_ID: 'GET  /api/videos/:id',
    UPLOAD: 'POST /api/videos/upload',
    LIKE: 'POST /api/videos/:id/like',
    DISLIKE: 'POST /api/videos/:id/dislike',
    SEARCH: 'GET  /api/videos?search=query',
  },
  COMMENTS: {
    LIST: 'GET  /api/videos/:videoId/comments',
    CREATE: 'POST /api/videos/:videoId/comments',
  },
};

module.exports = {
  DEFAULT_PORT,
  DEFAULT_MONGODB_URI,
  MONGODB_CONNECTED_STATE,
  ENVIRONMENT_DEVELOPMENT,
  HTTP_STATUS,
  API_ENDPOINTS,
};
