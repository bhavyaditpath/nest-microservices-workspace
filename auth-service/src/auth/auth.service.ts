import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login-auth.dto';
import { RegisterDto } from './dto/register-auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Repository } from 'typeorm';
import { UserAuth } from './user-auth.entity';
import { RefreshToken } from './refresh-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ApiResponse, ApiResponseUtil, HashUtil, LoginResponse } from 'shared';
import { EmailService } from './email.service';
import { UserRole } from 'src/common/enums/role.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserAuth)
    private userRepo: Repository<UserAuth>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) { }

  async register(dto: RegisterDto): Promise<ApiResponse> {
    const exists = await this.userRepo.findOne({
      where: { username: dto.username },
    });

    if (exists) {
      return ApiResponseUtil.error('Username already exists');
    }

    const hashedPassword = await HashUtil.hash(dto.password);

    const newUser = this.userRepo.create({
      username: dto.username,
      password: hashedPassword,
      role: dto.role,
      branchId: dto.branchId,
    });

    const savedUser = await this.userRepo.save(newUser);
    return ApiResponseUtil.success(savedUser, 'User registered successfully');
  }

  async login(dto: LoginDto): Promise<ApiResponse> {
    const user = await this.userRepo.findOne({
      where: { username: dto.username, isRemoved: false },
    });

    if (!user) return ApiResponseUtil.error('Invalid credentials');

    const passwordMatch = await HashUtil.compare(dto.password, user.password);

    if (!passwordMatch) return ApiResponseUtil.error('Invalid credentials');

    const tokens = await this.generateTokens(user);

    return ApiResponseUtil.success(tokens, 'Login successful');
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<ApiResponse> {
    const user = await this.userRepo.findOne({
      where: { username: dto.username },
    });

    if (!user) {
      return ApiResponseUtil.error('User not found');
    }

    const payload = {
      sub: user.id,
      username: user.username,
    };

    const token = this.jwtService.sign(payload, { expiresIn: '15m' });

    await this.emailService.sendResetPasswordEmail(user.username, token);

    return ApiResponseUtil.success(null, 'Reset email sent successfully');
  }

  async validateResetToken(token: string): Promise<ApiResponse> {
    try {
      const payload = this.jwtService.verify(token);

      const user = await this.userRepo.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        return ApiResponseUtil.error('Invalid token');
      }

      return ApiResponseUtil.success({ valid: true }, 'Token is valid');
    } catch (error) {
      return ApiResponseUtil.error('Invalid or expired token');
    }
  }

  async resetPassword(dto: ResetPasswordDto): Promise<ApiResponse> {
    try {
      const payload = this.jwtService.verify(dto.token);

      const user = await this.userRepo.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        return ApiResponseUtil.error('Invalid token');
      }

      const hashedPassword = await HashUtil.hash(dto.newPassword);

      await this.userRepo.update(user.id, { password: hashedPassword });

      return ApiResponseUtil.success(null, 'Password reset successfully');
    } catch {
      return ApiResponseUtil.error('Invalid or expired token');
    }
  }

  async googleLogin(req: any, res: any): Promise<void> {
    if (!req.user) {
      res.redirect(
        `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3005')}/login?error=google_auth_failed`,
      );
      return;
    }

    const { email, firstName, lastName, picture, googleId } = req.user;

    // Find user by googleId
    let user = await this.userRepo.findOne({
      where: { googleId },
    });

    if (!user) {
      // Check for existing user by email or username
      const existingUser = await this.userRepo.findOne({
        where: [{ email }, { username: email }],
      });

      if (existingUser) {
        // Link Google to existing user
        existingUser.googleId = googleId;
        existingUser.firstName = firstName;
        existingUser.lastName = lastName;
        existingUser.profilePicture = picture;
        existingUser.isEmailVerified = true;

        user = await this.userRepo.save(existingUser);
      } else {
        // User doesn't exist - redirect with error
        res.redirect(
          `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3005')}/auth/login?error=user_not_found`,
        );
        return;
      }
    }

    const tokens = await this.generateTokens(user);

    // Redirect to frontend with tokens
    const redirectUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3005')}/auth/google/callback?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`;
    res.redirect(redirectUrl);
  }

  private async generateTokens(user: UserAuth): Promise<LoginResponse> {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      branchId: user.branchId,
    };

    const accessToken = this.jwtService.sign(
      { ...payload, type: 'access' },
      { expiresIn: '45m' },
    );

    const refreshTokenString = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      { expiresIn: '7d' },
    ); // 7 days expiry

    // Store refresh token in database
    const refreshTokenEntity = this.refreshTokenRepo.create({
      token: refreshTokenString,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    await this.refreshTokenRepo.save(refreshTokenEntity);

    return {
      access_token: accessToken,
      refresh_token: refreshTokenString,
    };
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      if (payload.type !== 'refresh') {
        return ApiResponseUtil.error('Invalid refresh token');
      }

      // Check if refresh token exists in database and is not revoked
      const storedToken = await this.refreshTokenRepo.findOne({
        where: { token: refreshToken, isRevoked: false },
        relations: ['user'],
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        return ApiResponseUtil.error('Invalid or expired refresh token');
      }

      const user = storedToken.user;

      // Revoke the old refresh token
      await this.refreshTokenRepo.update(storedToken.id, { isRevoked: true });

      const tokens = await this.generateTokens(user);
      return ApiResponseUtil.success(tokens, 'Token refreshed');
    } catch {
      return ApiResponseUtil.error('Invalid or expired refresh token');
    }
  }

  async getProfile(userId: number): Promise<ApiResponse> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: [
        'id',
        'username',
        'email',
        'firstName',
        'lastName',
        'profilePicture',
        'role',
        'branchId',
      ],
    });

    if (!user) {
      return ApiResponseUtil.error('User not found');
    }

    // Transform response to include branch name
    const profile = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      role: user.role,
      branch: null,
      branchId: user.branchId,
    };

    return ApiResponseUtil.success(profile, 'Profile retrieved successfully');
  }

  async sendReportEmail(to: string, subject: string, html: string, attachment?: { filename: string; content: Buffer; contentType: string }): Promise<ApiResponse> {
    try {
      await this.emailService.sendReportEmail(to, subject, html, attachment);
      return ApiResponseUtil.success(null, 'Report email sent successfully');
    } catch (error) {
      return ApiResponseUtil.error('Failed to send report email');
    }
  }
}
