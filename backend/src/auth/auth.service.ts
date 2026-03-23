import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import {JwtService} from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  //function to sign up new user 
  async signup(email:string, name: string, password:string) {
    const existingUser = await this.prisma.user.findUnique({
        where: {email}, 
    });

    if (existingUser) {
        throw new UnauthorizedException('Email already in use');
    }

    //encrypt the password such that we don't store a pure password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    //create the user in the database
    const user = await this.prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name
        },
    });

    //Gerate a JWT token for this user, for json web token, aka your key token
    const token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
    });

    return {
            access_token: token, 
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            }
        };
    }

    async login(email:string, password:string){
        const user = await this.prisma.user.findUnique({
            where: {email},
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        //compare passwords, check if correct 
        //bcrypt.compare() = compares the plain password with the hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }
        //generate a json web token for this user 
        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
        });

        //return token and user info (give them access)
        return {
            access_token: token, 
            user: {
                id: user.id,
                email: user.email, 
                name: user.name,
            },
        };
    }

    //Validate user from json web token payload 
    async validateUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: {id: userId},
        });

        if(!user) {
            throw new UnauthorizedException("User Not Found");
        }
        return user;
    }
        
}