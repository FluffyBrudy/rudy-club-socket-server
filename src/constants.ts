export const JSON_HEADERS = {
  "Content-Type": "application/json",
};

export const STATUS_CODES = {
  UNAUTHORIZED_REQUEST: 401,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SUCCESS: 200,
};

export const ERROR_MESSAGES = {
  NO_AUTH_TOKEN: { error: "no auth token provided" },
  UNAUTHORIZED_ACCESS: { error: "unauthorized access" },
  MISSING_FIELDS: { error: "expected receiver id and data" },
  INVALID_RECEIVER: { error: "invalid receiver id" },
  GENERIC_ERROR: { error: "error occurred" },
  BAD_JSON_ERROR: { error: "bad json data" },
};

export const SUCCESS_MESSAGES = {
  NOTIFICATION_SENT: { message: "notification successfully sent" },
  CONNECTED_SUCCESSFULLY: { message: "connected successfully" },
  RECEIVER_OFFLINE: { message: "receiver is offline" },
};
