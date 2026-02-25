import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { Job, JobStatus } from './schemas/job.schema';
import { AiService } from '../ai/ai.service';

const mockJob = {
    _id: 'job-id-123',
    title: 'Fix the pipeline',
    description: 'The CI pipeline is broken and needs to be fixed',
    status: JobStatus.PENDING,
    owner: 'user-id-123',
    aiSummary: null,
    save: jest.fn().mockResolvedValue(this),
};

const mockJobModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
};

const mockAiService = {
    generateJobSummary: jest.fn().mockResolvedValue('AI generated summary'),
};

describe('JobsService', () => {
    let service: JobsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JobsService,
                { provide: getModelToken(Job.name), useValue: mockJobModel },
                { provide: AiService, useValue: mockAiService },
            ],
        }).compile();

        service = module.get<JobsService>(JobsService);
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a job with the correct owner', async () => {
            mockJobModel.create.mockResolvedValue(mockJob);

            const result = await service.create(
                { title: 'Fix the pipeline', description: 'The CI pipeline is broken and needs to be fixed' },
                'user-id-123',
            );

            expect(mockJobModel.create).toHaveBeenCalledWith(
                expect.objectContaining({ owner: 'user-id-123' }),
            );
            expect(result.title).toBe('Fix the pipeline');
        });
    });

    describe('findAll', () => {
        it('should return all jobs for a user', async () => {
            mockJobModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([mockJob]) });

            const result = await service.findAll('user-id-123');

            expect(mockJobModel.find).toHaveBeenCalledWith({ owner: 'user-id-123' });
            expect(result).toHaveLength(1);
        });

        it('should filter jobs by status when provided', async () => {
            mockJobModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([mockJob]) });

            await service.findAll('user-id-123', JobStatus.PENDING);

            expect(mockJobModel.find).toHaveBeenCalledWith({
                owner: 'user-id-123',
                status: JobStatus.PENDING,
            });
        });
    });

    describe('update', () => {
        it('should throw NotFoundException if job does not exist', async () => {
            mockJobModel.findById.mockResolvedValue(null);

            await expect(
                service.update('bad-id', { status: JobStatus.COMPLETED }, 'user-id-123'),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException if user does not own the job', async () => {
            mockJobModel.findById.mockResolvedValue({
                ...mockJob,
                owner: { toString: () => 'different-user-id' },
            });

            await expect(
                service.update('job-id-123', { status: JobStatus.COMPLETED }, 'user-id-123'),
            ).rejects.toThrow(ForbiddenException);
        });

        it('should update and return the job if the owner matches', async () => {
            const saveMock = jest.fn().mockResolvedValue({
                ...mockJob,
                status: JobStatus.COMPLETED,
            });

            mockJobModel.findById.mockResolvedValue({
                ...mockJob,
                owner: { toString: () => 'user-id-123' },
                save: saveMock,
            });

            const result = await service.update(
                'job-id-123',
                { status: JobStatus.COMPLETED },
                'user-id-123',
            );

            expect(saveMock).toHaveBeenCalled();
            expect(result.status).toBe(JobStatus.COMPLETED);
        });
    });
});
