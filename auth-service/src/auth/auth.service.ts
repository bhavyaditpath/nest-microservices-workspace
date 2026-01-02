import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserAuth } from './user-auth.entity';
import { RefreshToken } from './refresh-token.entity';
import { UserRole } from 'src/common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserAuth)
    private userRepo: Repository<UserAuth>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.userRepo.findOne({
      where: { username },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      userId: user.id,
      role: user.role,
      branchId: user.branchId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Store refresh token
    const refreshTokenEntity = this.refreshTokenRepo.create({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    await this.refreshTokenRepo.save(refreshTokenEntity);

    return {
      accessToken,
      refreshToken,
    };
  }

  async register(username: string, password: string, role: UserRole, branchId?: number) {
    const existingUser = await this.userRepo.findOne({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepo.create({
      username,
      password: hashedPassword,
      role,
      branchId,
    });

    await this.userRepo.save(user);

    return { message: 'User registered successfully' };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return { valid: true, payload };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  async refreshToken(refreshToken: string) {
    const tokenEntity = await this.refreshTokenRepo.findOne({
      where: { token: refreshToken, isRevoked: false },
      relations: ['user'],
    });

    if (!tokenEntity || tokenEntity.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = tokenEntity.user;
    const payload = {
      userId: user.id,
      role: user.role,
      branchId: user.branchId,
    };

    const newAccessToken = this.jwtService.sign(payload);
    const newRefreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Revoke old refresh token
    tokenEntity.isRevoked = true;
    await this.refreshTokenRepo.save(tokenEntity);

    // Store new refresh token
    const newTokenEntity = this.refreshTokenRepo.create({
      token: newRefreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await this.refreshTokenRepo.save(newTokenEntity);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    const tokenEntity = await this.refreshTokenRepo.findOne({
      where: { token: refreshToken },
    });

    if (tokenEntity) {
      tokenEntity.isRevoked = true;
      await this.refreshTokenRepo.save(tokenEntity);
    }

    return { message: 'Logged out successfully' };
  }
}
