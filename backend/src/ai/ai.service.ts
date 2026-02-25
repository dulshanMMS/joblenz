import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
    // Logger lets us see what's happening in production without crashing the app
    private readonly logger = new Logger(AiService.name);
    private readonly genAI: GoogleGenerativeAI;

    constructor(private configService: ConfigService) {
        this.genAI = new GoogleGenerativeAI(
            this.configService.get<string>('GEMINI_API_KEY')!,
        );
    }

    async generateJobSummary(
        title: string,
        description: string,
    ): Promise<string | null> {
        try {
            const model = this.genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
            });

            const prompt = `Generate a concise 2-3 sentence summary for the following service job request.
Focus on what needs to be done, where, and any key requirements. Be factual and clear.

Title: ${title}
Description: ${description}

Summary:`;

            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text().trim();

            return text || null;
        } catch (error) {
            // Log the error but return null — job creation must not fail because of AI
            this.logger.error('Failed to generate AI summary', error);
            return null;
        }
    }
}
