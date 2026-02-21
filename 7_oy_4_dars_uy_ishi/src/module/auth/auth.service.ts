import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateAuthDto, LoginAuthDto } from "./dto/create-auth.dto";
import { Auth } from "./entities/auth.entity";
import * as bcrypt from "bcrypt";
import * as nodemailer from "nodemailer";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { VerifyAuthDto } from "./dto/verify.dto";

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;
  constructor(
    @InjectRepository(Auth) private authRepository: Repository<Auth>,
    private jwtService: JwtService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "assomad377@gmail.com",
        pass: process.env.APP_KEY,
      },
    });
  }

  async register(createAuthDto: CreateAuthDto): Promise<{message: string}> {
    try {
      const { username, email, password } = createAuthDto;
      const foundedUser = await this.authRepository.findOne({
        where: { email },
      });

      if (foundedUser) throw new BadRequestException("Email already exsits");

      const hashPassword = await bcrypt.hash(password, 10);

      const code = Array.from({ length: 6 }, () =>
        Math.floor(Math.random() * 10),
      ).join("");

      await this.transporter.sendMail({
        from: "assomad377@gmail.com",
        to: email,
        subject: "Otp",
        text: "Simple",
        html: `<b>${code}</b>`,
      });

      const time = Date.now() + 120000;

      const user = this.authRepository.create({
        username,
        email,
        password: hashPassword,
        otp: code,
        otpTime: time,
      });

      await this.authRepository.save(user);

      return {message: "Registered"}
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async verify(
    verifyAuthDto: VerifyAuthDto,
  ): Promise<{ access_token: string }> {
    try {
      const { email, otp } = verifyAuthDto;
      const foundedUser = await this.authRepository.findOne({
        where: { email },
      });

      if (!foundedUser) throw new BadRequestException("User not found");

      const otpValidation = /^\d{6}$/.test(otp);

      if (!otpValidation) throw new BadRequestException("Wrong otp validation");

      const time = Date.now();

      if (time > foundedUser.otpTime)
        throw new BadRequestException("Otp expired");

      if (otp !== foundedUser.otp) throw new BadRequestException("Wrong otp");

      await this.authRepository.update(foundedUser.id, {otp: "", otpTime: 0})

      const payload = { email: foundedUser.email, roles: foundedUser.role };
      const access_token = await this.jwtService.signAsync(payload);
      return {
        access_token,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async login(loginAuthDto: LoginAuthDto): Promise<{message: string}> {
    const {email, password} = loginAuthDto
    const foundedUser = await this.authRepository.findOne({where: {email}})

    if(!foundedUser) throw new UnauthorizedException("User not found")

    const comp = await bcrypt.compare(password, foundedUser.password)

    if(comp) {
      const code = Array.from({ length: 6 }, () =>
        Math.floor(Math.random() * 10),
      ).join("");

      await this.transporter.sendMail({
        from: "assomad377@gmail.com",
        to: email,
        subject: "Otp",
        text: "Simple",
        html: `<b>${code}</b>`,
      });

      const time = Date.now() + 120000

      await this.authRepository.update(foundedUser.id, {otp: code, otpTime: time})

      return {message: "Otp sent. Please check your email"}
    } else {
      return {message: "Wrong password"}
    }
  }

  // async findAll(): Promise<Auth[]> {
  //   return await this.authModel.findAll()
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  async remove(id: number): Promise<boolean> {
    await this.authRepository.delete(id)
    return true
  }
}
