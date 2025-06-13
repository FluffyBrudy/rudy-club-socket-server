export function wrapResponse<T>(data?: T) {
  if (data === undefined) {
    return JSON.stringify({ success: true });
  }
  return JSON.stringify({
    data: data,
    success: true,
  });
}

export const sendAcknowledgement = () => wrapResponse();
