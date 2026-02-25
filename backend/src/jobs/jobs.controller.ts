import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobStatus } from './schemas/job.schema';

@UseGuards(JwtAuthGuard) // All routes in this controller require a valid JWT
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  create(
    @Body() createJobDto: CreateJobDto,
    @GetUser() user: { userId: string },
  ) {
    return this.jobsService.create(createJobDto, user.userId);
  }

  @Get()
  findAll(
    @GetUser() user: { userId: string },
    @Query('status') status?: JobStatus,
  ) {
    return this.jobsService.findAll(user.userId, status);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @GetUser() user: { userId: string },
  ) {
    return this.jobsService.update(id, updateJobDto, user.userId);
  }
}
