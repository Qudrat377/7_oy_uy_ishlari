import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto, LoginAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { VerifyAuthDto } from './dto/verify.dto';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

@ApiBearerAuth("JWT-auth")
@ApiTags("Auth")
@ApiInternalServerErrorResponse({description: "Internal server error"})
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({description: "Register api (public)"})
  @ApiCreatedResponse({description: "Registred new user"})
  @ApiBadRequestResponse({description: "User already exsits"})
  @ApiBody({type: CreateAuthDto})
  @HttpCode(200)
  @Post("register")
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.register(createAuthDto);
  }

  @ApiOperation({description: "Verify api (public)"})
  @ApiOkResponse({description: "Token"})
  @ApiBadRequestResponse({description: "User not found"})
  @ApiBody({type: VerifyAuthDto})
  @HttpCode(200)
  @Post("verify")
  verify(@Body() verifyAuthDto: VerifyAuthDto) {
    return this.authService.verify(verifyAuthDto);
  }

  @ApiOperation({description: "Login api (public)"})
  @ApiOkResponse({description: "Send email code"})
  @ApiUnauthorizedResponse({description: "User not found"})
  @HttpCode(200)
  @Post("login")
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  // @Get()
  // findAll() {
  //   return this.authService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  @ApiOperation({description: "Delete api (owner)"})
  @ApiOkResponse({description: "SoftDeleted user"})
  @HttpCode(200)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
