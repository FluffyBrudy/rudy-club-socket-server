export function wrapResponse<T>(data?: T, failed = false) {
  if (!data) {
    return JSON.stringify({ success: true });
  }
  return JSON.stringify({
    data: data,
    success: true && !failed,
  });
}

export const sendAcknowledgement = () => wrapResponse();
