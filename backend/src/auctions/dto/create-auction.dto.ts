import { IsString, IsNotEmpty, IsInt, Min, Max } from 'class-validator';

export class CreateAuctionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @Min(100)
  startingPriceCents: number;

  @IsInt()
  @Min(60)
  @Max(86400)
  durationSeconds: number;
}
