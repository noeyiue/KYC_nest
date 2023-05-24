import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

const saltOrRound = 10;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user) {
      const isMatch = await bcrypt.compare(pass, user.password);
      if (!isMatch) {
        return null;
      }
      return user;
    }
    return null;
  }

  async login(username: string, userId: string) {
    const payload = { username: username, sub: userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signup(username: string, password: string, firstname: string, lastname: string, email: string, phone: string): Promise<any> {
    const user1 = await this.usersService.findOneByEmailorPhone(email, phone)
    const user2 = await this.usersService.findOne(username);
    
    if (user1 || user2) {
      throw new HttpException(
        'Username or Email or Phone Taken',
        HttpStatus.BAD_REQUEST,
      );
    }
    const hash = await bcrypt.hash(password, saltOrRound);
    const newUser = await this.usersService.createUser(username, hash, firstname, lastname, email, phone);
    return {
      userId: newUser.userId,
    };
  }
}
