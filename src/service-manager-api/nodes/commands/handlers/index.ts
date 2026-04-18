import { ApproveNodeCommandHandler } from './approve-node.command-handler';
import { CreateNodeServiceCommandHandler } from './create-node-service.command-handler';
import { CreateNodeCommandHandler } from './create-node.command-handler';
import { DownloadNodeIsoCommandHandler } from './download-node-iso.command-handler';

export const CommandHandlers = [
    CreateNodeCommandHandler,
    ApproveNodeCommandHandler,
    CreateNodeServiceCommandHandler,
    DownloadNodeIsoCommandHandler,
];
