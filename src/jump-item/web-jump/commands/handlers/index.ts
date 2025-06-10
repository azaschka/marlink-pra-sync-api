import { CopyWebJumpCommandHandler } from './copy-web-jump.command-handler';
import { CreateWebJumpCommandHandler } from './create-web-jump.command-handler';
import { DeleteWebJumpCommandHandler } from './delete-web-jump.command-handler';
import { ModifyWebJumpCommandHandler } from './modify-web-jump.command-handler';
import { SyncWebJumpsCommandHandler } from './sync-web-jumps.command-handler';

export const CommandHandlers = [
    CreateWebJumpCommandHandler,
    ModifyWebJumpCommandHandler,
    DeleteWebJumpCommandHandler,
    SyncWebJumpsCommandHandler,
    CopyWebJumpCommandHandler,
];
