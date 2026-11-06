import { BaseApi } from "../common/base-api";
import type { FloristCompensation } from "@/types/florist-compensations/florist-compensation";

class FloristCompensationsApi extends BaseApi<
    FloristCompensation,
    FloristCompensation,
    never,
    never
> {
    constructor() {
        super("/florist/compensations");
    }
}

export const floristCompensationsApi = new FloristCompensationsApi();
