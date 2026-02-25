import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        const { name, email, password } = registerDto;

        // Check if a user with this email already exists
        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new ConflictException('Email is already registered');
        }

        // Hash the password with bcrypt (10 salt rounds is the industry standard)
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await this.userModel.create({
            name,
            email,
            password: hashedPassword,
        });

        return this.generateToken(user);
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        // Find user — we use select('+password') if password is excluded by default
        const user = await this.userModel.findOne({ email });
        if (!user) {
            // Use a generic message — never reveal whether email or password was wrong
            throw new UnauthorizedException('Invalid credentials');
        }

        // Compare the plain password against the stored hash
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.generateToken(user);
    }

    private generateToken(user: UserDocument) {
        const payload = { sub: user._id, email: user.email };
        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        };
    }
}
