import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto, LoginAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Auth } from './entities/auth.entity';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from "bcrypt"
import * as nodemailer from "nodemailer"
import * as jwt from "jsonwebtoken"
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth) private authModel: typeof Auth,
    private jwtService: JwtService
  ) {}

  private transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "assomad377@gmail.com",
      pass: process.env.APP_KEY
    }
  })
  async register(createAuthDto: CreateAuthDto): Promise<Auth> {
    const {username, email, password} = createAuthDto
    const foundedUser = await this.authModel.findOne({where: {email}})

    if(foundedUser) throw new BadRequestException("Email already exsits")
    
    const hashPassword = await bcrypt.hash(password, 10)

    const code = Array.from({length: 6}, () => Math.floor(Math.random() * 10)).join("")

    await this.transporter.sendMail({
      from: "assomad377@gmail.com",
      to: email,
      subject: "Otp",
      text: "Simple",
      html: `<b>${code}</b>`
    })
    return await this.authModel.create({username, email, password: hashPassword})
  }

  async login(loginAuthDto: LoginAuthDto): Promise<{message: string} | {token: string}> {
    const {email, password} = loginAuthDto
    const foundedUser = await this.authModel.findOne({where: {email}})

    if(!foundedUser) throw new UnauthorizedException("User not found")

    const comp = await bcrypt.compare(password, foundedUser.dataValues.password)

    if(comp) {
      return {token: await this.jwtService.sign({email: foundedUser.email})}
    } else {
      return {message: "Wrong password"}
    }
  }

  async findAll(): Promise<Auth[]> {
    return await this.authModel.findAll()
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  async remove(id: number): Promise<boolean> {
    await this.authModel.destroy({where: {id: +id}})
    return true
  }
}
