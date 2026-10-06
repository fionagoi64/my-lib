import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '@/prisma/prisma.service';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { UpdateProfileDto } from '@/user/dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Email address is already registered');
    }

    let defaultRole = await this.prisma.role.findUnique({
      where: { name: 'USER' },
    });

    if (!defaultRole) {
      defaultRole = await this.prisma.role.create({
        data: {
          name: 'USER',
          description: 'Standard Library Reader',
        },
      });
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        roleId: defaultRole.id,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: {
          select: {
            name: true,
          },
        },
        createdAt: true,
      }
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: {
          select: {
            name: true,
          },
        },
        profile: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    // Verify user exists first
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Upsert the user profile row, then return the same aggregate shape as
    // GET /users/profile so clients do not need two response contracts.
    await this.prisma.userProfile.upsert({
      where: { userId },
      update: {
        phone: updateProfileDto.phone,
        address: updateProfileDto.address,
        avatarUrl: updateProfileDto.avatarUrl,
        bio: updateProfileDto.bio,
      },
      create: {
        userId,
        phone: updateProfileDto.phone,
        address: updateProfileDto.address,
        avatarUrl: updateProfileDto.avatarUrl,
        bio: updateProfileDto.bio,
      },
    });

    return this.getProfile(userId);
  }

  async updateRole(userId: string, roleName: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new NotFoundException(`Role "${roleName}" is not configured.`);
    }

    // Update the user's role
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        roleId: role.id,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });
  }
}
