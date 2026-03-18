import type { LayoutServerLoad } from './$types';
import { NETWORK_COOKIE_NAME, getNetworkFromCookie } from '$lib/config/network';

export const load: LayoutServerLoad = ({ cookies }) => {
    const network = getNetworkFromCookie(cookies.get(NETWORK_COOKIE_NAME));

    return {
        network,
    };
};
