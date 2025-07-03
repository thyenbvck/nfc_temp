import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHomepage(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>NestJS Homepage</title>
        <style>
          body {
            font-family: sans-serif;
            background: #f5f5f5;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 50px;
          }
          h1 {
            color: #e0234e;
          }
          a {
            margin-top: 20px;
            background: #e0234e;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 6px;
          }
        </style>
      </head>
      <body>
        <h1>🚀 Welcome to NestJS API</h1>
        <p>This page is returned by AppService.</p>
        <a href="/docs">Go to API</a>
      </body>
      </html>
    `;
  }
}
