import { IsUUID, IsInt, Min } from 'class-validator';

export class PlaceBidDto {
  @IsUUID()
  userId: string;

  @IsInt()
  @Min(1)
  amountCents: number;
}
