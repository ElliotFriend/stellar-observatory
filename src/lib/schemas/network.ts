import { z, Network } from './common';

export const SetNetworkRequest = z
    .object({
        network: Network,
    })
    .openapi('SetNetworkRequest');

export const SetNetworkResponse = z
    .object({
        network: Network,
    })
    .openapi('SetNetworkResponse');
