import { Injectable } from '@nestjs/common';
import type { OpenAPIObject } from '@nestjs/swagger';

@Injectable()
export class DocsService {
    private document: OpenAPIObject | null = null;

    setDocument(doc: OpenAPIObject) {
        this.document = doc;
    }

    getDocument(): OpenAPIObject | null {
        return this.document;
    }
}
