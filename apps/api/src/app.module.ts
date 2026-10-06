import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { UserModule } from '@/user/user.module';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { BorrowModule } from './borrow/borrow.module';
import { RulesModule } from './rules/rules.module';
import { NotificationModule } from './notification/notification.module';
import { OpenLibraryModule } from './open-library/open-library.module';
import { PublicModule } from './public/public.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule, BooksModule, BorrowModule, RulesModule, NotificationModule, OpenLibraryModule, PublicModule],
})
export class AppModule {}
