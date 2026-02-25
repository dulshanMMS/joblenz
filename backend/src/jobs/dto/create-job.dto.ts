import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateJobDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(10, { message: 'Description must be at least 10 characters' })
    description: string;
}
