import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type JobDocument = Job & Document;

export enum JobStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in-progress',
    COMPLETED = 'completed',
}

@Schema({ timestamps: true })
export class Job {
    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ required: true, trim: true })
    description: string;

    @Prop({ type: String, enum: JobStatus, default: JobStatus.PENDING })
    status: JobStatus;

    @Prop({ type: String, default: null })
    aiSummary: string | null;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    owner: Types.ObjectId;
}

export const JobSchema = SchemaFactory.createForClass(Job);
