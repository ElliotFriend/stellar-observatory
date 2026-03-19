import type { LayoutServerLoad } from './$types';
import { NETWORK_COOKIE_NAME, getNetworkFromCookie } from '$lib/config/network';
import { getRpcUrl } from '$lib/server/config/network';

export const load: LayoutServerLoad = ({ cookies }) => {
    const network = getNetworkFromCookie(cookies.get(NETWORK_COOKIE_NAME));

    return {
        network,
        rpcUrl: getRpcUrl(network),
    };
};
