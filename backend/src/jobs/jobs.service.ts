import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument, JobStatus } from './schemas/job.schema';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { AiService } from '../ai/ai.service';

@Injectable()
export class JobsService {
    private readonly logger = new Logger(JobsService.name);

    constructor(
        @InjectModel(Job.name) private jobModel: Model<JobDocument>,
        private readonly aiService: AiService,
    ) { }

    async create(createJobDto: CreateJobDto, userId: string): Promise<JobDocument> {
        // Only call Gemini if description is substantial enough to summarize
        // This avoids wasting free-tier quota on short/test entries
        const isWorthSummarizing = createJobDto.description.trim().length >= 50;

        const aiSummary = isWorthSummarizing
            ? await this.aiService.generateJobSummary(
                  createJobDto.title,
                  createJobDto.description,
              )
            : null;

        const job = await this.jobModel.create({
            ...createJobDto,
            owner: userId,
            aiSummary,
        });

        return job;
    }

    async findAll(userId: string, status?: JobStatus): Promise<JobDocument[]> {
        // Build query — always filter by owner, optionally filter by status
        const query: Record<string, unknown> = { owner: userId };

        if (status) {
            query.status = status;
        }

        return this.jobModel.find(query).sort({ createdAt: -1 });
    }

    async update(
        jobId: string,
        updateJobDto: UpdateJobDto,
        userId: string,
    ): Promise<JobDocument> {
        try {
            const job = await this.jobModel.findById(jobId);

            if (!job) {
                throw new NotFoundException('Job not found');
            }

            // Ensure the job belongs to the requesting user
            if (job.owner.toString() !== userId) {
                throw new ForbiddenException('You do not have access to this job');
            }

            const updated = await this.jobModel
                .findByIdAndUpdate(jobId, { $set: updateJobDto }, { new: true, runValidators: true })
                .lean();

            return updated as JobDocument;
        } catch (error) {
            // Only log truly unexpected errors — not intentional 404/403 responses
            if (!(error instanceof NotFoundException) && !(error instanceof ForbiddenException)) {
                this.logger.error('Update job failed', error);
            }
            throw error;
        }
    }
}
