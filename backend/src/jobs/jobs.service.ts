import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument, JobStatus } from './schemas/job.schema';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
  ) {}

  async create(createJobDto: CreateJobDto, userId: string): Promise<JobDocument> {
    // AI summary will be generated and added here in Phase 5
    const job = await this.jobModel.create({
      ...createJobDto,
      owner: userId,
      aiSummary: null,
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
    const job = await this.jobModel.findById(jobId);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Ensure the job belongs to the requesting user
    if (job.owner.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this job');
    }

    Object.assign(job, updateJobDto);
    return job.save();
  }
}
