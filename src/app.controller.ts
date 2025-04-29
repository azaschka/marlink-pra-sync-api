import { Controller, Get, UsePipes, ValidationPipe } from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
@UsePipes(new ValidationPipe({ transform: true }))
export class AppController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
    ) {
        this.commandBus.subscribe((command) => {
            console.log('Command received:', command);
        });

        this.queryBus.subscribe((query) => {
            console.log('Query received:', query);
        });

        this.eventBus.subscribe((event) => {
            console.log('Event received:', event);
        });
    }

    @Get()
    public ping(): string {
        return 'pong';
    }
}
