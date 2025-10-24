import { CreateJumpointCommandHandler } from './create-jumpoint.command-handler';
import { DeleteJumpointCommandHandler } from './delete-jumpoint.command-handler';
import { MarkJumpointAsSyncedCommandHandler } from './mark-jumpoint-as-synced.command-handler';
import { MarkJumpointNodeAsSyncedCommandHandler } from './mark-jumpoint-node-as-synced.command-handler';
import { ModifyJumpointCommandHandler } from './modify-jumpoint.command-handler';

export const CommandHandlers = [
    CreateJumpointCommandHandler,
    ModifyJumpointCommandHandler,
    DeleteJumpointCommandHandler,
    MarkJumpointAsSyncedCommandHandler,
    MarkJumpointNodeAsSyncedCommandHandler,
];
