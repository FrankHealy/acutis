import type { ProductKey } from "@acutis/shared-contracts";
export type TelemetryEvent = { name: string; product: ProductKey; tenantId?: string; properties?: Record<string, string | number | boolean> };
export interface TelemetrySink { track(event: TelemetryEvent): void }
export const noOpTelemetry: TelemetrySink = { track: () => undefined };
export function redactSensitivePath(path:string){return path.replace(/(\/api(?:-proxy\/api)?\/video-consultations\/invitations\/)[^/]+/i,"$1[REDACTED]").replace(/(\/vc\/join\/)[^/]+/i,"$1[REDACTED]")}
