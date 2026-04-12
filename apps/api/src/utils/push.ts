export interface PushMessage {
  title: string
  body: string
  data?: Record<string, string>
}

export async function sendPushNotification(
  expoPushToken: string,
  message: PushMessage,
): Promise<void> {
  if (!expoPushToken.startsWith('ExponentPushToken[')) return

  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      body: JSON.stringify({
        to: expoPushToken,
        sound: 'default',
        title: message.title,
        body: message.body,
        data: message.data ?? {},
      }),
    })
  } catch (err) {
    // Non-fatal — never let push failures affect the capture response
    console.warn('[Push] Failed to send notification:', err)
  }
}

export async function sendPushNotifications(
  tokens: string[],
  message: PushMessage,
): Promise<void> {
  const valid = tokens.filter((t) => t.startsWith('ExponentPushToken['))
  if (valid.length === 0) return

  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      body: JSON.stringify(
        valid.map((to) => ({
          to,
          sound: 'default',
          title: message.title,
          body: message.body,
          data: message.data ?? {},
        }))
      ),
    })
  } catch (err) {
    console.warn('[Push] Failed to send notifications:', err)
  }
}
