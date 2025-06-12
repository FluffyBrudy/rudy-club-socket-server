export function wrapResponse<T>(data?: T) {
  if (!data) {
    return JSON.stringify({ success: true });
  }
  return JSON.stringify({
    data: data,
    success: true,
  });
}

export const sendAcknowledgement = () => wrapResponse();
