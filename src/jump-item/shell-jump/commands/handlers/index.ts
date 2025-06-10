import { CopyShellJumpCommandHandler } from './copy-shell-jump.command-handler';
import { CreateShellJumpCommandHandler } from './create-shell-jump.command-handler';
import { DeleteShellJumpCommandHandler } from './delete-shell-jump.command-handler';
import { ModifyShellJumpCommandHandler } from './modify-shell-jump.command-handler';
import { SyncShellJumpsCommandHandler } from './sync-shell-jumps.command-handler';

export const CommandHandlers = [
    CreateShellJumpCommandHandler,
    ModifyShellJumpCommandHandler,
    DeleteShellJumpCommandHandler,
    SyncShellJumpsCommandHandler,
    CopyShellJumpCommandHandler,
];
