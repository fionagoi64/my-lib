# Deployment and real-time notification plan

## Current implementation

`apps/api` persists a notification in PostgreSQL, then publishes a `notification` Server-Sent Event (SSE) to the reader's open inbox. `apps/user-web` listens to the stream and refreshes the React Query inbox. The database remains the source of truth: on reconnect, `/notification/mine` returns anything emitted while the browser was offline.

This is suitable for local development and a single API replica. Set `NEXT_PUBLIC_API_BASE_URL` in each web deployment and set `CORS_ORIGINS` in the API deployment to the comma-separated deployed web origins. All production traffic, including SSE, must be HTTPS.

## Production scale-out

The in-memory stream registry only reaches users connected to the same API process. Before running more than one API replica, replace `NotificationService.publish` with a Redis pub/sub adapter:

1. Write the notification and an outbox row in one PostgreSQL transaction.
2. A worker publishes the outbox event to Redis after commit and retries failures.
3. Every API replica subscribes to Redis and forwards events to its locally connected SSE clients.
4. Configure the load balancer for long-lived SSE connections, disable response buffering, and set an idle timeout above the desired connection lifetime.

The SSE query token is a browser limitation while the project uses bearer tokens in local storage. For production, move access authentication to secure, same-site HttpOnly cookies (or issue a short-lived, single-use stream ticket) so tokens are never placed in URLs or logs.

## Deployment units

- `apps/user-web`: reader-facing Next.js deployment.
- `apps/admin-web`: administrator Next.js deployment.
- `apps/api`: NestJS API deployment with PostgreSQL; add Redis and a worker for multi-replica realtime delivery.
- `packages/api` and `packages/ui`: workspace libraries built with the applications.

## Open Library book discovery

Book discovery is server-side and limited to authenticated librarians. The API sends a low-volume, human-initiated search request, identifies the application via `OPEN_LIBRARY_USER_AGENT`, returns only the selected fields, and caches results for one minute. It is not used as the reader catalog backend: a librarian must import a selected title into PostgreSQL and set local inventory before readers can borrow it.
