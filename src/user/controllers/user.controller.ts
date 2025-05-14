import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { UuidUtility } from '../../shared/utilities';
import { CreateUserCommand, DeleteUserCommand, UpdateUserCommand } from '../commands';
import { CreateUserDtoInput, RetrieveUsersDtoInput, UpdateUserDtoInput } from '../dtos/inputs';
import { UserCreatedDtoOutput, UserRetrievedDtoOutput, UserUpdatedDtoOutput } from '../dtos/outputs';
import { User } from '../models';
import { RetrieveUsersQuery } from '../queries';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
@UsePipes(new ValidationPipe({ transform: true }))
export class UserController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Get()
    @ApiOkResponse({ type: UserRetrievedDtoOutput, isArray: true })
    public async retrieveUsers(@Query() dtoInput: RetrieveUsersDtoInput): Promise<UserRetrievedDtoOutput[]> {
        const result = await this.queryBus.execute<RetrieveUsersQuery, User[]>(
            new RetrieveUsersQuery(
                UuidUtility.generate(),
                dtoInput.pageSize,
                dtoInput.pageNumber,
                dtoInput.securityProviderId,
                dtoInput.username,
                dtoInput.email,
            ),
        );

        return result;
    }

    @Post()
    @ApiCreatedResponse({ type: UserCreatedDtoOutput })
    public async createUser(@Body() dtoInput: CreateUserDtoInput): Promise<UserCreatedDtoOutput> {
        const result = await this.commandBus.execute<CreateUserCommand, User>(
            new CreateUserCommand(
                UuidUtility.generate(),
                dtoInput.publicDisplayName,
                dtoInput.username,
                dtoInput.password,
                dtoInput.passwordExpirationDate,
                dtoInput.email,
                dtoInput.preferredEmailLanguage,
                dtoInput.isTwoFactorAuthRequired,
                dtoInput.isLoginAllowed,
                dtoInput.failedLoginAttempts,
                dtoInput.mustResetPasswordOnNextLogin,
            ),
        );

        return result;
    }

    @Put(':id')
    @ApiParam({ name: 'id', type: Number, required: true })
    @ApiOkResponse({ type: UserUpdatedDtoOutput })
    public async updateUser(
        @Param('id') id: number,
        @Body() dtoInput: UpdateUserDtoInput,
    ): Promise<UserUpdatedDtoOutput> {
        const result = await this.commandBus.execute<UpdateUserCommand, User>(
            new UpdateUserCommand(
                UuidUtility.generate(),
                id,
                dtoInput.publicDisplayName,
                dtoInput.username,
                dtoInput.password,
                dtoInput.passwordExpirationDate,
                dtoInput.email,
                dtoInput.preferredEmailLanguage,
                dtoInput.isTwoFactorAuthRequired,
                dtoInput.isLoginAllowed,
                dtoInput.failedLoginAttempts,
                dtoInput.mustResetPasswordOnNextLogin,
            ),
        );

        return result;
    }

    @Delete(':id')
    @ApiParam({ name: 'id', type: Number, required: true })
    @HttpCode(HttpStatus.NO_CONTENT)
    public async deleteUser(@Param('id') id: number): Promise<void> {
        await this.commandBus.execute<DeleteUserCommand, void>(new DeleteUserCommand(UuidUtility.generate(), id));
    }
}
