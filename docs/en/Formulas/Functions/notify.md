# notify

Sends a notification to the user.

## Signature

```ts
function notify(messageType: string, message: string): string;
```

## Arguments

- `messageType: string`: The message type of the notification. Valid types are:
  - `info`
  - `warn`
  - `error`
- `message: string`: The message which should be displayed in the notification.

## Return

The `message` (output is the same as `message`).

## Examples

- `notify('info', 'You have spend 1 Action-Point')` Sends an info-notification with the message `You have spend 1 Action-Point`.
- `notify('warn', 'Target not selected')` Sends a warn-notification with the message `Target not selected`.
- `notify('error', 'No points left')` Sends an error-notification with the message `No points left`.
