import { useSyncExternalStore } from "react"

import { getToken, subscribeToken } from "@/API/token"

/** The current token, re-rendering when it's set or cleared anywhere. */
export const useToken = () => useSyncExternalStore(subscribeToken, getToken)
