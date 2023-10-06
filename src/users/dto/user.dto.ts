import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ROLES } from 'src/constants/roles';

export class UserDTO {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsEnum(ROLES)
  role: ROLES;
}

export class UserUpdateDTO {
    @IsOptional()
    @IsString()
    firstName: string;
  
    @IsOptional()
    @IsString()
    lastName: string;
  
    @IsOptional()
    @IsString()
    email: string;
  
    @IsOptional()
    @IsString()
    username: string;
  
    @IsOptional()
    @IsString()
    password: string;
  
    @IsOptional()
    @IsEnum(ROLES)
    role: ROLES;
  }