import { Body, Controller, Get, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UuidUtility } from '../../shared/utilities';
import { CreateUserCommand } from '../commands';
import { CreateUserDtoInput, RetrieveUsersDtoInput } from '../dtos/inputs';
import { UserCreatedDtoOutput, UserRetrievedDtoOutput } from '../dtos/outputs';
import { UserCreated, UserRetrieved } from '../models';
import { RetrieveUsersQuery } from '../queries';

@ApiBearerAuth()
@ApiTags('User')
@Controller('user')
@UsePipes(new ValidationPipe({ transform: true }))
export class UserController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Get()
    @ApiOkResponse({ type: UserRetrievedDtoOutput, isArray: true })
    public async retrieveUsers(@Query() dtoInput: RetrieveUsersDtoInput): Promise<UserRetrievedDtoOutput[]> {
        const result = await this.queryBus.execute<RetrieveUsersQuery, UserRetrieved[]>(
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
        const result = await this.commandBus.execute<CreateUserCommand, UserCreated>(
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
}
