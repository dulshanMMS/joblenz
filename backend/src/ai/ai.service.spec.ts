import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';

// Mock the entire Gemini SDK
jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
            generateContent: jest.fn().mockResolvedValue({
                response: {
                    text: jest.fn().mockReturnValue('This is a generated AI summary.'),
                },
            }),
        }),
    })),
}));

const mockConfigService = {
    get: jest.fn().mockReturnValue('mock-api-key'),
};

describe('AiService', () => {
    let service: AiService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiService,
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        service = module.get<AiService>(AiService);
    });

    it('should return a generated summary string', async () => {
        const result = await service.generateJobSummary(
            'Fix the pipeline',
            'The main water pipeline in sector 4 is leaking and needs immediate repair.',
        );

        expect(result).toBe('This is a generated AI summary.');
    });

    it('should return null if Gemini throws an error', async () => {
        const { GoogleGenerativeAI } = jest.requireMock('@google/generative-ai');
        GoogleGenerativeAI.mockImplementationOnce(() => ({
            getGenerativeModel: jest.fn().mockReturnValue({
                generateContent: jest.fn().mockRejectedValue(new Error('API quota exceeded')),
            }),
        }));

        // Re-create the service so it picks up the new mock
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiService,
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        const failingService = module.get<AiService>(AiService);
        const result = await failingService.generateJobSummary('title', 'description');

        // Must return null — not throw — so job creation is unaffected
        expect(result).toBeNull();
    });
});
