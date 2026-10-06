import { Module } from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { BorrowController } from './borrow.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BorrowService],
  controllers: [BorrowController],
  exports: [BorrowService],
})
export class BorrowModule {}
