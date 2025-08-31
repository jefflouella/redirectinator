# Redirectinator Backend Server

This is the backend proxy server for the Redirectinator application. It helps bypass CORS restrictions when checking redirects on websites that block cross-origin requests.

## Features

- **CORS Bypass**: Makes requests from the server side to avoid browser CORS restrictions
- **Redirect Tracking**: Comprehensive redirect chain analysis
- **Fallback Support**: Automatically falls back to different request methods when needed
- **Security**: Includes proper headers and timeout handling

## API Endpoints

### POST /api/check-redirect

Check redirects for a given URL.

**Request Body:**
```json
{
  "url": "https://example.com",
  "method": "HEAD" | "GET",
  "followRedirects": true | false,
  "maxRedirects": 10
}
```

**Response:**
```json
{
  "finalUrl": "https://example.com/final",
  "finalStatusCode": 200,
  "statusChain": ["301", "301", "200"],
  "redirectCount": 2,
  "redirectChain": ["https://example.com", "https://example.com/redirect1"],
  "hasLoop": false,
  "hasMixedTypes": false,
  "domainChanges": false,
  "httpsUpgrade": true
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Running the Server

```bash
# Start the server
npm run server

# Or start both frontend and backend together
npm run dev:full
```

The server will run on `http://localhost:3001` by default.

## Configuration

The server accepts the following environment variables:

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment mode

## Security Features

- CORS protection with specific origin allowlist
- Helmet.js for security headers
- Request timeout handling
- Input validation

## Dependencies

- `express`: Web framework
- `cors`: CORS handling
- `helmet`: Security headers
- `morgan`: Request logging
- `node-fetch`: HTTP requests
