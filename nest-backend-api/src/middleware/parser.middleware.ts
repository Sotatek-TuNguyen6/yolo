// src/common/middleware/query-parser.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as qs from 'qs';

// Extend Express Request interface
interface RequestWithParsedQuery extends Request {
  _parsedQuery?: qs.ParsedQs;
}

@Injectable()
export class QueryParserMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.url.includes('?')) {
      const [, queryString] = req.url.split('?');

      // Parse with proper nested object support
      const parsedQuery = qs.parse(queryString, {
        allowDots: true,
        parseArrays: true,
        depth: 10, // Allow deep nesting
      });

      // Attach the parsed query to the request object
      (req as RequestWithParsedQuery)._parsedQuery = parsedQuery;

      // Access parsed query via req._parsedQuery in your controllers
    }
    next();
  }
}
