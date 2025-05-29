import { CreateJumpointCommandHandler } from './create-jumpoint.command-handler';
import { DeleteJumpointCommandHandler } from './delete-jumpoint.command-handler';
import { ModifyJumpointCommandHandler } from './modify-jumpoint.command-handler';
import { SyncJumpointsCommandHandler } from './sync-jumpoints.command-handler';

export const CommandHandlers = [
    CreateJumpointCommandHandler,
    ModifyJumpointCommandHandler,
    DeleteJumpointCommandHandler,
    SyncJumpointsCommandHandler,
];
