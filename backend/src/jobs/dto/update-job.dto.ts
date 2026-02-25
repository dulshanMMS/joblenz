import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { JobStatus } from '../schemas/job.schema';

export class UpdateJobDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    @MinLength(10)
    description?: string;

    @IsOptional()
    @IsEnum(JobStatus, {
        message: 'Status must be one of: pending, in-progress, completed',
    })
    status?: JobStatus;
}
