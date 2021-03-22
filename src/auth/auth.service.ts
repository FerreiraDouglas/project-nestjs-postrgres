import {
    Injectable,
    UnprocessableEntityException,
    UnauthorizedException,
  } from '@nestjs/common';
  import { UserRepository } from '../users/users.repository';
  import { InjectRepository } from '@nestjs/typeorm';
   
  import { User } from '../users/user.entity';
 
  import { CredentialsDto } from './dto/credentials.dto';
  import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { UserRole } from 'src/users/enum';
  
  @Injectable()
  export class AuthService {
    constructor(
      @InjectRepository(UserRepository)
      private userRepository: UserRepository,
      private jwtService: JwtService,
    ) {}
  
    async signUp(createUserDto: CreateUserDto): Promise<User> {
      if (createUserDto.password != createUserDto.passwordConfirmation) {
        throw new UnprocessableEntityException('As senhas não conferem');
      } else {
        return await this.userRepository.createUser(createUserDto, UserRole.USER);
      }
    }
  
    async signIn(credentialsDto: CredentialsDto) {
      const user = await this.userRepository.checkCredentials(credentialsDto);
  
      if (user === null) {
        throw new UnauthorizedException('Credenciais inválidas');
      }
  
      const jwtPayload = {
        id: user.id,
      };
      const token = await this.jwtService.sign(jwtPayload);
  
      return { token };
    }
  }